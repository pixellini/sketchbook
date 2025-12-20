import { Assets, Sprite, Text, Container, Graphics, ContainerChild } from 'pixi.js'
import { gsap } from 'gsap'
import { createCenterPosition } from '@pixellini/pixi-utils'
import { COLORS, SPACE_STATIONS } from '../constants/shared.ts'

/**
 * Data from the astronaut API.
 */
export interface Astronaut {
    name: string
    craft: string
}

/**
 * Animated astronaut sprite with orbit behavior.
 */
export interface AstronautGraphic {
    container: Container<ContainerChild>,
    sprite: Sprite,
    enterAnimation: (angle: number, delay: number) => gsap.core.Timeline
    animate: () => void
}

const ORBIT_SPEED = 1 // 2 minutes for one orbit
const ORBIT_SIZE = 200
const ASTRONAUT_HEIGHT = 64 // px
const ASTRONAUT_WIDTH = 38 // px
const ASTRONAUT_SIZE_SCALE = 0.8
const ASTRONAUT_SUIT: { [key: string]: string } = {
    ISS: '/astronauts/assets/astronaut-iss.png',
    Tiangong: '/astronauts/assets/astronaut-tiangong.png'
}

async function getTexture(craft: string) {
    const astronautImage = ASTRONAUT_SUIT[craft] || ASTRONAUT_SUIT.ISS
    return await Assets.load(astronautImage)
}

async function createAstronautGraphic(astronaut: Astronaut) {
    const texture = await getTexture(astronaut.craft)
    const pos = createCenterPosition()
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5)
    sprite.height = ASTRONAUT_HEIGHT * ASTRONAUT_SIZE_SCALE
    sprite.width = ASTRONAUT_WIDTH * ASTRONAUT_SIZE_SCALE
    sprite.x = pos.x
    sprite.y = pos.y
    sprite.alpha = 0
    sprite.eventMode = 'static'
    sprite.cursor = 'pointer'
    sprite.label = `Astronaut: ${astronaut.name}`

    return sprite
}

/**
 * Creates an astronaut sprite that orbits around the center of the viewport.
 */
export async function createAstronaut(astronaut: Astronaut): Promise<AstronautGraphic> {
    const container = new Container({ label: 'Astronaut' })
    const sprite = await createAstronautGraphic(astronaut)

    container.addChild(sprite)

    const base = createCenterPosition()
    const state = { angle: 0 }
    const tl = gsap.timeline()

    function enterAnimation(angle: number) {
        state.angle = angle
        return tl
        .to(sprite, {
            x: base.x + Math.cos(state.angle) * ORBIT_SIZE,
            y: base.y + Math.sin(state.angle) * ORBIT_SIZE,
            duration: 3,
        })
        .to(sprite, {
            alpha: 1,
            duration: 1,
        }, '-=1.5')
    }
    
    function animate() {
        gsap.to(state, {
            angle: state.angle + Math.PI * 2,
            duration: 120 / ORBIT_SPEED,
            ease: 'none',
            repeat: -1,
            onUpdate: () => {
                gsap.set(sprite, {
                    x: base.x + Math.cos(state.angle) * ORBIT_SIZE,
                    y: base.y + Math.sin(state.angle) * ORBIT_SIZE
                })
            }
        })
    }

    return {
        container,
        sprite,
        enterAnimation,
        animate
    }
}