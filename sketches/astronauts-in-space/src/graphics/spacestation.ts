import gsap from 'gsap'
import { createCenterPosition, createPosition, type Position } from '@pixellini/pixi-utils'
import { Assets, Sprite } from 'pixi.js'

const ORBIT_RADIUS = 250
const ORBIT_SPEED = 1

/**
 * Creates all space station sprites that orbit the center.
 */
export async function createSpaceStations() {
    const stations = []

    // Temporarily using the astronaut sprite.
    // TODO: Make a space station sprite for ISS and Tiangong.
    const ISS = await createStation('ISS', '/astronauts/assets/astronaut.png')

    stations.push(ISS)

    return stations
}

/**
 * Creates a single orbiting space station sprite.
 */
export async function createStation(_name: string, texture: string) {
    const state = {
        increment: 0
    }

    const base = createCenterPosition()
    const pos = createPosition(
        base.x + Math.cos(state.increment) * ORBIT_RADIUS,
        base.y + Math.sin(state.increment) * ORBIT_RADIUS
    )

    const image = await Assets.load(texture)
    const sprite = new Sprite(image)
    sprite.anchor.set(0.5)
    sprite.height = 34
    sprite.width = 24
    // sprite.zIndex = 400
    sprite.x = pos.x
    sprite.y = pos.y
    sprite.alpha = 0

    function updateCoords(increment: number): Position {
        return {
            x: base.x + Math.cos(increment) * ORBIT_RADIUS,
            y: base.y + Math.sin(increment) * ORBIT_RADIUS
        }
    }

    function animate() {
        gsap.to(sprite, {
            alpha: 1,
            duration: 1
        })
        
        const tl = gsap.timeline()
        tl.to(sprite, {
            ease: 'none',
            repeat: -1,
            onUpdate: () => {
                state.increment += (ORBIT_SPEED / 1000)

                gsap.set(sprite, updateCoords(state.increment))
            }
        })

        tl.progress(Math.random())
    }

    return {
        sprite,
        animate
    }
}