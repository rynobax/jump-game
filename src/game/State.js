import 'pixi.js';
import 'p2';
import Phaser from 'phaser';
import { pick } from 'lodash';

function serializeState(world) {
  const sprites = recursivelyGetSprites(world.children);
  const spriteData = getSpriteData(sprites);
  return {sprites: spriteData};
}

function recursivelyGetSprites(children){
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
    return pick(sprite, ['x', 'y', 'key', 'frame', 'scale'])
  });
}

export { serializeState };