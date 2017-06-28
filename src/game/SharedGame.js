// Image imports
import sky from './assets/sky.png';
import ground from './assets/platform.png';
import dude from './assets/dude.png';

function sharedPreload(game){
  game.load.image('sky', sky);
  game.load.image('ground', ground);
  game.load.spritesheet('dude', dude, 32, 48);
}

export { sharedPreload };
