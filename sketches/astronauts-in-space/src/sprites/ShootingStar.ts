import { Graphics, Point } from 'pixi.js'
import { gsap } from 'gsap'
import { MathUtils, Screen, StageContainer } from '@pixellini/stagehand'
import { COLORS } from '../constants/shared.ts'

// The dimensions the shooting star in pixels.
const STAR_SIZE = 2
const TRAIL_WIDTH = 1
// A mapper for how far a shooting star will travel.
const TRAVEL_DISTANCES = [150, 250]
// A mapper for how long the "shooting" animation will take.
const DURATION_RANGE = [0.3, 0.5]

/**
 * Represents a star with a thin white trail that quickly flies across the background.
 * 
 * The Shooting Star is a container because it's made up of 2 graphics: a star and a trail.
 * The star is the head, and the trail is the thin white line.
 */
export class ShootingStar extends StageContainer {
    private star: Graphics // the head of the shooting star
    private trail: Graphics
    private travelDistance!: number
    private duration!: number

    constructor() {
        super({ label: 'Shooting Star' })
        
        this.star = new Graphics()
            .rect(0, -STAR_SIZE / 2, STAR_SIZE, STAR_SIZE)
            .fill(COLORS.BLUE)
        this.star.zIndex = 10
        this.star.alpha = 0

        this.trail = new Graphics()
            .rect(0, -TRAIL_WIDTH / 2, TRAIL_WIDTH, TRAIL_WIDTH)
            .fill(COLORS.WHITE)
        this.trail.zIndex = 0
        this.trail.alpha = 0

        this.addChild(this.trail, this.star)
    }

    override onReady() {
        this.spawn()
    }

    public spawn = () => {
        this.reset()
        gsap.delayedCall(
            MathUtils.randomInt(1, 3),
            () => this.shoot()
        )
    }

    public shoot() {
        const d1 = this.duration
        const d2 = this.duration * 0.25
        const d3 = this.duration * 0.4
        const d4 = this.duration * 0.5
        const d5 = this.duration * 1.25

        this.animator.add('shoot', {
            onComplete: this.spawn
        })
        .add('start', 0)
        .to(this, {
            x: this.x + Math.cos(this.rotation) * this.travelDistance / 2,
            y: this.y + Math.sin(this.rotation) * this.travelDistance / 2,
            duration: d1
        }, 0)
        .to(this.star, { 
            keyframes: [
                { alpha: 1, duration: d2 },
                { x: this.travelDistance, duration: d1, ease: 'none' }
            ]
        }, 'start')
        .to(this.trail, { 
            keyframes: [
                { alpha: 0.2, duration: d2 },
                { width: this.travelDistance, duration: d1, ease: 'none' }
            ]
        }, 'start')
        .to(this.star, { 
            alpha: 0, 
            duration: d4
        }, `-=${d3}`)
        .to(this.trail, { 
            alpha: 0, 
            duration: d5
        }, `-=${d3}`)

        this.animator.play('shoot')
    }

    /**
     * Resets position and visuals for a new shot.
     */
    public reset() {
        if (this.destroyed) return

        const targetX = Math.random() * globalThis.innerWidth
        const targetY = Math.random() * globalThis.innerHeight
        
        // I didn't want the shooting stars to spawn close to the window edges,
        // because I noticed it made them harder to see, and sometimes they would shoot off-screen.
        // This is why I clamped the position to spawn into a smaller "container" area.
        this.x = gsap.utils.clamp(200, Screen.width - 200, targetX)
        this.y = gsap.utils.clamp(200, Screen.height - 200, targetY)

        this.rotation = Math.random() * Math.PI * 2
        this.pivot.set(0, 0)
        
        // Reset children
        this.star.x = 0
        this.star.alpha = 0
        this.trail.width = 0
        this.trail.alpha = 0

        // Each shooting star will shoot in a different direction.
        this.travelDistance = gsap.utils.random(TRAVEL_DISTANCES[0], TRAVEL_DISTANCES[1])
        this.duration = gsap.utils.mapRange(
            TRAVEL_DISTANCES[0],
            TRAVEL_DISTANCES[1],
            DURATION_RANGE[0],
            DURATION_RANGE[1],
            this.travelDistance
        )
    }
}