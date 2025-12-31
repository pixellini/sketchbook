import { Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { spriteFadeInWithDelay } from '../utils/animations.ts'
import { random, randomInt } from '@pixellini/utils'
import { createPosition } from '@pixellini/pixi-utils'
import { COLORS } from '../constants/shared.ts'

enum Star {
    Small,
    Medium,
    Large,
}

const STAR_COLORS = [
    COLORS.WHITE,
    COLORS.YELLOW, 
    COLORS.BLUE,
    COLORS.ORANGE,
    COLORS.PINK
]
const STAR_SIZES: Record<number, number> = {
    [Star.Small]: 1,
    [Star.Medium]: 2,
    [Star.Large]: 3
}

/**
 * Creates a twinkling star graphic at a random viewport position.
 */
export function createStar() {
    const pos = createPosition(
        randomInt(globalThis.innerWidth),
        randomInt(globalThis.innerHeight)
    )
    const size = getSize()
    const dimensions = STAR_SIZES[size]
    const colour = gsap.utils.random(STAR_COLORS)

    const sprite = new Graphics({ label: 'Star' })
    sprite.rect(-dimensions / 2, -dimensions / 2, dimensions, dimensions)
    sprite.fill(colour)
    sprite.rotation = Math.random()
    sprite.position.set(pos.x, pos.y)
    sprite.zIndex = 100

    spriteFadeInWithDelay(sprite)
    animate()

    function getSize() {
        const choice = random()
        if (choice <= 0.8) {
            return Star.Small
        }
        if (choice <= 0.95) {
            return Star.Medium
        }
        return Star.Large
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
