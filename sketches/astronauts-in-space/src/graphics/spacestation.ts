import gsap from 'gsap'
import { Assets, Sprite } from 'pixi.js'

// The sprite alpha, which gives the illusion of distance.
const SPRITE_ALPHA = 0.2
const SPRITE_SIZE = 48

/**
 * Creates a single space station sprite.
 */
export async function createStation(name: string, texture: string) {
    const state = {
        clickable: false,
        selected: false
    }

    const image = await Assets.load(texture)
    const sprite = new Sprite(image)
    sprite.label = 'Space Station: ' + name
    sprite.anchor.set(0.5)
    sprite.height = SPRITE_SIZE
    sprite.width = SPRITE_SIZE
    sprite.x = globalThis.innerWidth * 0.8
    sprite.y = globalThis.innerHeight * 0.8
    sprite.alpha = 0
    sprite.zIndex = 1000
    sprite.eventMode = 'static'
    sprite.cursor = 'pointer'

    gsap.to(sprite, {
        alpha: SPRITE_ALPHA,
        duration: 1,
        delay: 3,
        onComplete: () => {
            state.clickable = true
        }
    })

    sprite.on('pointertap', () => {
        if (!state.clickable) {
            return
        }

        const size = state.selected ? SPRITE_SIZE : SPRITE_SIZE * 2.5
        gsap.to(sprite, {
            height: size,
            width: size,
            alpha: state.selected ? SPRITE_ALPHA : 1,
            duration: 2,
            ease: 'power4.out'
        })
        state.selected = !state.selected
    })

    return {
        sprite,
    }
}