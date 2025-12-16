import { Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { spriteFadeInWithDelay } from '../utils/animations.ts'
import { random } from '@pixellini/math'
import { createPosition } from '@pixellini/pixi-utils'
import { COLORS } from '../constants/colors.ts'

const STAR_COLORS = [
    COLORS.WHITE,
    COLORS.YELLOW, 
    COLORS.BLUE,
    COLORS.ORANGE,
    COLORS.PINK
]

enum Size {
    Small,
    Medium,
    Large
}

/**
 * Creates a twinkling star graphic at a random viewport position.
 */
export function createStar() {
    const pos = createPosition(
        random(globalThis.innerWidth),
        random(globalThis.innerHeight)
    )
    const size = getSize()
    const colour = gsap.utils.random(STAR_COLORS)

    const sprite = new Graphics()
        .rect(-size / 2, -size / 2, size, size)
        .fill(colour)
    sprite.rotation = Math.random()
    sprite.position.set(pos.x, pos.y)
    sprite.zIndex = 100

    spriteFadeInWithDelay(sprite)
    animate()

    function getSize() {
        const rand = Math.random()
        if (rand < 0.65) {
            return Size.Small
        } else if (rand < 0.90) {
            return Size.Medium
        } else {
            return Size.Large
        }
    }

    // Twinkle Animation
    function animate() {
        const baseScale = 1
        const bigScale = gsap.utils.random(1.5, 1.5, 0.05)

        const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: gsap.utils.random(0.5, 3),
        })

        tl.to(sprite.scale, {
            keyframes: [
                // Small twinkle
                { x: baseScale * 1.2, y: baseScale * 1.2, duration: 0.15, ease: 'power1.inOut' },
                { x: baseScale,       y: baseScale,       duration: 0.15, ease: 'power1.inOut' },
                { x: baseScale * 1.2, y: baseScale * 1.2, duration: 0.15, ease: 'power1.inOut' },
                { x: baseScale,       y: baseScale,       duration: 0.15, ease: 'power1.inOut' },
                // Big twinkle
                { x: bigScale,        y: bigScale,        duration: 0.35, ease: 'power2.inOut' },
                { x: baseScale,       y: baseScale,       duration: 0.4,  ease: 'power2.inOut' },
            ]
        })
    }

    return {
        sprite,
        size,
        colour
    }
}
