import 'pixi.js';
import 'p2';
import Phaser from 'phaser';
import { random } from 'lodash';
import React from 'react';

// Image imports
import sky from './assets/sky.png';
import ground from './assets/platform.png';
import dude from './assets/dude.png';

const gameWidth = 800;
const gameHeight = 600;

function createGame(inputPlayers, onUpdateCb, ignore, getPlayerInput) {
  const state = { preload: preload, create: create, update: update}
  let renderMode = Phaser.AUTO;
  if (ignore){
    ignore.forEach((key) => {
      delete state[key];
    });
  }

  var game = new Phaser.Game(gameWidth, gameHeight, renderMode, 'gameDiv', state);

  function preload() {
    game.load.image('sky', sky);
    game.load.image('ground', ground);
    game.load.spritesheet('dude', dude, 32, 48);
    game.stage.disableVisibilityChange = true;
  }

  let players;
  let platforms;

  function create() {
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Prevent pausing when tabbed out
    game.stage.disableVisibilityChange = false;
    //Phaser.RequestAnimationFrame(game, true);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    // Destroy it when it leaves the screen
    ground.checkWorldBounds = true;
    ground.events.onOutOfBounds.add((o) => {
      o.destroy();
    });

    players = Object.assign({}, inputPlayers);
    for(const playerName in inputPlayers){
      // The player and its settings
      const playerSprite = game.add.sprite(500, game.world.height - 150, 'dude');

      //  We need to enable physics on the player
      game.physics.arcade.enable(playerSprite);

      //  Player physics properties. Give the little guy a slight bounce.
      playerSprite.body.bounce.y = 0;
      playerSprite.body.gravity.y = 1000;
      
      playerSprite.checkWorldBounds = true;
      playerSprite.events.onOutOfBounds.add((o) => {
        if(o.x < 0 || o.y > 0){
          o.kill();
          players[playerName].text.destroy();
          delete players[playerName];
          if(Object.keys(players).length === 0) {
            game.paused = true;
            const style = {font: '32px Calibri', boundsAlignH: 'center', boundsAlignV: 'middle', align: 'center'};
            const text = game.add.text(0, 0, playerName + ' is the winner!\nRestarting in 5 seconds.', style);
            text.y = (game.height/2) - (text.height/2);
            text.x = (game.width/2) - (text.width/2);
            setTimeout(() => {
              game.paused = false;
              game.state.restart();
            }, 5000)
          }
        }
      });

      //  Our two animations, walking left and right.
      playerSprite.animations.add('left', [0, 1, 2, 3], 10, true);
      playerSprite.animations.add('right', [5, 6, 7, 8], 10, true);
      players[playerName].sprite = playerSprite;

      const style = {font: '16px Arial', align: 'center'};
      const text = game.add.text(0, 0, playerName, style);
      players[playerName].text = text;

      //debugText = game.add.text(0, 0, '');
    };
  }

  function addPlatform() {
    function getHeight(lastY) {
      // Get the range of valid heights for platforms
      const heightMax = game.height - 64;
      const heightMin = 200;

      const maxDiff = 100;

      // Get the range for the platform we are about to get
      // This is based off the last platform created
      // so that the player will be able to jump to it
      let rangeMax = lastY + maxDiff;
      if(rangeMax > heightMax) rangeMax = heightMax;
      let rangeMin = lastY - maxDiff;
      if(rangeMin < heightMin) rangeMin = heightMin;

      const num = random(rangeMin, rangeMax);
      return num;
    }

    const latestPlatform = platforms.getTop();
    var ledge = platforms.create(game.width, getHeight(latestPlatform.y), 'ground');
    ledge.body.immovable = true;
    ledge.checkWorldBounds = true;
    ledge.events.onOutOfBounds.add((o) => {
      o.destroy();
    });
  }

  function shouldAddPlatform(){
    const pc = platforms.length;
    let chance;
    if(platforms.getTop().x > game.width - 200){
      chance = 0;
    } else {
      switch(pc) {
        case 0:
          chance = 1/1;
          break;
        case 1:
          chance = 1/30;
          break;
        case 2:
          chance = 1/200;
          break;
        case 3:
          chance = 1/400;
          break;
        default:
          chance = 0;
      }
    }
    //debugText.text = chance;
    if(Math.random() < chance) {
      return true;
    } else {
      return false;
    }
  }

  function update() {
    const speed = 3;
    // Update players
    for(const playerName in players) {
      const input = getPlayerInput(playerName);
      const playerSprite = players[playerName].sprite;

      playerSprite.x -= speed;

      //  Collide the player and the stars with the platforms
      game.physics.arcade.collide(playerSprite, platforms);

      //  Reset the players velocity (movement)
      playerSprite.body.velocity.x = 0;

      if (input.left)
      {
          //  Move to the left
          playerSprite.body.velocity.x = -200;

          playerSprite.animations.play('left');
      }
      else if (input.right)
      {
          //  Move to the right
          playerSprite.body.velocity.x = 400;

          playerSprite.animations.play('right');
      }
      else
      {
          //  Stand still
          playerSprite.animations.stop();

          playerSprite.frame = 4;
      }

      //  Allow the player to jump if they are touching the ground.
      if (input.up && playerSprite.body.touching.down)
      {
          playerSprite.body.velocity.y = -700;
      }

      const playerText = players[playerName].text;
      playerText.x = playerSprite.x+(playerSprite.width/2)-(playerText.width/2);
      playerText.y = playerSprite.y-22;
    }

    // Update Platforms
    platforms.forEach((platform) => {
      platform.x -= speed;
    });

    // Possibly add another platform
    if(shouldAddPlatform()) {
      addPlatform();
    }

    if(onUpdateCb != null) onUpdateCb(game);
  }
    

  return game;
}

function gameDiv() {
  return (
    <div style={{width: '100vw', height: '100vh', position: 'fixed', background: 'white', left: '0px', top: '64px'}}>
      <div id='gameDiv' style={{margin: 'auto', width: gameWidth+'px', height: gameHeight+'px'}}/>
    </div>
  );
}

export { createGame, gameDiv }