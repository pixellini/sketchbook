import { Assets, Sprite } from 'pixi.js'
import { spriteFadeIn } from '../utils/animations.ts'

const EARTH_SPRITE_URL = '/astronauts/assets/earth.png'

/**
 * Creates an Earth sprite centered in the viewport.
 */
export async function createEarth() {
    const texture = await Assets.load(EARTH_SPRITE_URL)
    const sprite = new Sprite(texture)
    sprite.label = 'Earth'
    sprite.zIndex = 200
    sprite.anchor.set(0.5)
    sprite.position.set(globalThis.innerWidth / 2, globalThis.innerHeight / 2)
    sprite.scale.set(0.25)

    spriteFadeIn(sprite)

    return {
        sprite
    }
}