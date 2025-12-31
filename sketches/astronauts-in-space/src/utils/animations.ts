import { Graphics, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { randomInt } from '@pixellini/utils'

export function spriteFadeIn(sprite: Sprite | Graphics, options: { delay?: number } = {}) {
    sprite.alpha = 0
    return gsap.to(sprite, {
        alpha: 1, 
        duration: 5, 
        ease: 'power1.out',
        ...options
    })
}

export function spriteFadeInWithDelay(sprite: Sprite | Graphics) {
    return spriteFadeIn(sprite, { 
        delay: randomInt(2) 
    })
}