import { Square, MathUtils } from '@pixellini/stagehand'
import { Point } from 'pixi.js'
import { COLORS } from '../constants/shared.ts'

// This acts as a map for the star size, with each entry being the dimension in pixels.
// The size is determined by the Star.type value.
const STAR_SIZES = [1,2,3]
const STAR_COLORS = [
    COLORS.WHITE,
    COLORS.YELLOW, 
    COLORS.BLUE,
    COLORS.ORANGE,
    COLORS.PINK,
]

/**
 * Represents a single star in the background.
 * 
 * I used a simple square rather than an actual sprite, because the star
 * isn't intended to be the focal point of the scene, and this saves on memory overhead.
 * 
 * @features
 * - Randomly sets its size to one of small, medium, or large.
 * - Randomly sets its colour.
 * - Randomly sets its rotation.
 * - Infinitely animates a twinkle.
 */
export class Star extends Square {
    public type: number
    
    constructor(pos: Point) {
        // This will return 1, 2 or 3 and maps nicely to the STAR_SIZES list.
        const type = MathUtils.randomWeighted([70, 15, 5])
        const size = STAR_SIZES[type]
        const color = STAR_COLORS[MathUtils.randomInt(0, STAR_COLORS.length - 1)]

        super({
            size,
            color
        })
        
        this.type = type
        this.position.set(pos.x, pos.y)
        this.alpha = 1
        this.rotation = Math.random()
    }

    override onCreate() {
        const baseScale = 1
        const bigScale = MathUtils.random(1.5, 1.8)
        const delay = MathUtils.random(0.5, 3)
        const duration = MathUtils.random(1, 3)

        this.animator.add('twinkle', {
            delay,
            repeat: -1,
            repeatDelay: delay,
            duration,
        })
        .to(this, {
            keyframes: [
                // Small twinkle
                { pixi: { scaleX: baseScale * 1.2, scaleY: baseScale * 1.2 }, duration: 0.15, ease: 'power1.inOut' },
                { pixi: { scaleX: baseScale,       scaleY: baseScale },       duration: 0.15, ease: 'power1.inOut' },
                { pixi: { scaleX: baseScale * 1.2, scaleY: baseScale * 1.2 }, duration: 0.15, ease: 'power1.inOut' },
                { pixi: { scaleX: baseScale,       scaleY: baseScale },       duration: 0.15, ease: 'power1.inOut' },
                
                // Bigger twinkle
                { pixi: { scaleX: bigScale,        scaleY: bigScale },        duration: 0.35, ease: 'power2.inOut' },
                { pixi: { scaleX: baseScale,       scaleY: baseScale },       duration: 0.4,  ease: 'power2.inOut' },
            ]
        })
    }
    
    public override onReady(): void {
        this.animator.play('twinkle')
    }
}