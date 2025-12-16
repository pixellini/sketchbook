import { Container, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { createRandomPosition } from '@pixellini/pixi-utils'
import { COLORS } from '../constants/colors.ts'

const STAR_SIZE = 2
const TRAIL_SIZE = 1
const TRAVEL_DISTANCES = [100, 250]
const DURATION_RANGE = [0.4, 0.6]

/**
 * Creates a shooting star with animated trail at a random viewport position.
 */
export function createShootingStar() {
    const pos = createRandomPosition()
    pos.x = gsap.utils.clamp(200, globalThis.innerWidth - 200, pos.x)
    pos.y = gsap.utils.clamp(200, globalThis.innerHeight - 200, pos.y)

    const travelDistance = gsap.utils.random(TRAVEL_DISTANCES)

    const container = new Container({ height: STAR_SIZE, width: travelDistance })
    container.pivot.set(container.width / 2, container.height / 2)
    container.rotation = Math.random() * Math.PI * 2
    container.position.set(pos.x, pos.y)

    const star = new Graphics()
        .rect(0, -STAR_SIZE/2, STAR_SIZE, STAR_SIZE)
        .fill(COLORS.BLUE)
    star.zIndex = 10
    star.alpha = 0

    const trail = new Graphics()
        .rect(0, -TRAIL_SIZE/2, TRAIL_SIZE, TRAIL_SIZE)
        .fill(COLORS.WHITE)
    trail.zIndex = 0
    trail.alpha = 0

    container.addChild(star)
    container.addChild(trail)

    function animate(callback: Function) {
        const tl = gsap.timeline({
            onComplete () {
                callback()
            }
        })

        const duration = gsap.utils.mapRange(
            TRAVEL_DISTANCES[0], 
            TRAVEL_DISTANCES[1], 
            DURATION_RANGE[0], 
            DURATION_RANGE[1], 
            travelDistance
        )

        const v1 = duration
        const v2 = duration * 0.25
        const v3 = duration * 0.4
        const v4 = duration * 0.5

        gsap.to(container, {
            x: pos.x + Math.cos(container.rotation) * travelDistance / 2,
            y: pos.y + Math.sin(container.rotation) * travelDistance / 2,
            duration: v1
        })

        const startLabel = 'start'

        tl
        .add(startLabel)
        .to(star, {
            alpha: 1,
            duration: v2
        }, startLabel)
        .to(star, {
            x: star.x + travelDistance,
            duration: v1,
            ease: 'none'
        }, startLabel)
        .to(trail, {
            alpha: 0.3,
            duration: v2
        }, startLabel)
        .to(trail, {
            width: travelDistance,
            duration: v1,
            ease: 'none'
        }, startLabel)
        .to(star, {
            alpha: 0,
            duration: v2
        }, '-=' + v3)
        .to(trail, {
            alpha: 0,
            duration: v4
        }, '-=' + v3)
    }

    return {
        sprite: container,
        animate
    }
}