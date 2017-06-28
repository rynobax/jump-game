import Phaser from 'phaser';
import { pick } from 'lodash';

function broadcastState(world, players) {
  const sprites = recursivelyGetSprites(world.children);
  console.log('sprites: ', sprites);
  const spriteData = getSpriteData(sprites);
  console.log('spriteData: ', spriteData);
  console.log('players: ', players);
  broadcastData(players, spriteData);
}

function recursivelyGetSprites(children){
  console.log('children: ', children);
  return children.reduce((sprites, child) => {
    if(child instanceof Phaser.Sprite){
      sprites.push(child);
    } else if (child instanceof Phaser.Group) {
      sprites.push(...recursivelyGetSprites(child.children));
    } else {
      throw('Unknown thing encountered getting sprites: ', child);
    }
    return sprites;
  }, []);
}

function getSpriteData(sprites) {
  return sprites.map((sprite) => {
    return pick(sprite, ['x', 'y', 'key', 'frame'])
  });
}

function broadcastData(players, spriteData) {
  players.forEach(({peer}) => {
    peer.send(JSON.stringify(spriteData));
  });
}

export { broadcastState };