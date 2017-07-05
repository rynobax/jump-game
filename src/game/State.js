import 'pixi.js';
import 'p2';
import Phaser from 'phaser';
import { pick } from 'lodash';

function serializeState(world) {
  const {sprites, texts} = recursivelyGetData(world.children);
  const spriteData = getSpriteData(sprites);
  const textData = getTextData(texts);
  return {sprites: spriteData, texts: textData};
}

function recursivelyGetData(children){
  return children.reduce((data, child) => {
    // The order matters because Text is a Child of Sprite,
    // so it would evaluate true to both
    if(child instanceof Phaser.Text){
      data.texts.push(child);
    } else if (child instanceof Phaser.Sprite) {
      data.sprites.push(child);
    }

    if(child.children.length > 0) {
      const {sprites, texts} = recursivelyGetData(child.children);
      data.sprites = data.sprites.concat(sprites);
      data.texts = data.texts.concat(texts);
    }

    return data;
  }, {
    sprites: [],
    texts: []
  });
}

function getSpriteData(sprites) {
  return sprites.map((sprite) => {
    return pick(sprite, ['x', 'y', 'key', 'frame', 'scale'])
  });
}

function getTextData(texts) {
  return texts.map((text) => {
    return pick(text, ['x', 'y', 'text', 'style'])
  });
}

export { serializeState };