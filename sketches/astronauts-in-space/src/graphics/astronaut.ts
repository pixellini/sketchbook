import { Assets, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { createCenterPosition } from '@pixellini/pixi-utils'

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
export interface AstronautSprite {
    sprite: Sprite,
    enterAnimation: (angle: number, delay: number) => gsap.core.Timeline
    animate: () => void
}

const ORBIT_SPEED = 1
const ASTRONAUT_HEIGHT = 36 // px
const ASTRONAUT_WIDTH = 18 // px
const ASTRONAUT_SIZE_SCALE = 1
const ASTRONAUT_SPRITE_URL = '/astronauts/assets/astronaut.png'
// TODO: Different sprite for each space station.
const CRAFTS: { [key: string]: string } = {
    'ISS': ASTRONAUT_SPRITE_URL,
    'Tiangong': ASTRONAUT_SPRITE_URL
}

/**
 * Creates an astronaut sprite that orbits around the center of the viewport.
 */
export async function createAstronaut({ craft }: Astronaut): Promise<AstronautSprite> {
    const texture = await getTexture(craft)
    const pos = createCenterPosition()

    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5)
    sprite.height = ASTRONAUT_HEIGHT * ASTRONAUT_SIZE_SCALE
    sprite.width = ASTRONAUT_WIDTH * ASTRONAUT_SIZE_SCALE
    sprite.zIndex = 400
    sprite.x = pos.x
    sprite.y = pos.y
    sprite.alpha = 0

    async function getTexture(craft: string) {
        const astronautImage = CRAFTS[craft] || ASTRONAUT_SPRITE_URL
        return await Assets.load(astronautImage)
    }

    const radius = 200
    const base = createCenterPosition()
    const state = { angle: 0 }
    const tl = gsap.timeline()

    function enterAnimation(angle: number) {
        state.angle = angle
        return tl
        .to(sprite, {
            x: base.x + Math.cos(state.angle) * radius,
            y: base.y + Math.sin(state.angle) * radius,
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
            duration: 120 / ORBIT_SPEED, // 2 minutes if orbit speed is 1
            ease: 'none',
            repeat: -1,
            onUpdate: () => {
                const x = base.x + Math.cos(state.angle) * radius
                const y = base.y + Math.sin(state.angle) * radius

                gsap.set(sprite, {
                    x: x,
                    y: y
                });
            }
        })
    }

    return {
        sprite,
        enterAnimation,
        animate
    }
}