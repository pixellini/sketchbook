import { Assets, Sprite, Text, Container, AnimatedSprite, Spritesheet, ContainerChild, Texture } from 'pixi.js'
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
    sprite: AnimatedSprite,
    enterAnimation: (angle: number, delay: number) => gsap.core.Timeline
    animate: () => void
    animations: {
        wave: (repeat?: number) => Promise<unknown>
        greet: () => Promise<unknown>
        reset: () => Promise<unknown>
    }
}

const ORBIT_SPEED = 1 // 2 minutes for one orbit
const ORBIT_SIZE = 200
const ASTRONAUT_SIZE_SCALE = 0.175
const ASTRONAUT_SPRITESHEET: { [key: string]: string } = {
    ISS: 'astronaut-iss-spritesheet',
    Tiangong: 'astronaut-tiangong-spritesheet'
}

/**
 * Create an animated sprite from spritesheet frames
 */
async function createAnimatedAstronautSprite(astronaut: Astronaut) {
    const type = ASTRONAUT_SPRITESHEET[astronaut.craft] || ASTRONAUT_SPRITESHEET.ISS
    
    const spritesheet = await Assets.load<Spritesheet>(`/astronauts/assets/spritesheets/${type}.json`)
    
    const sprite = AnimatedSprite.fromFrames(['astronauts 0.aseprite'])
    
    const pos = createCenterPosition()
    sprite.anchor.set(0.5)
    sprite.scale.set(ASTRONAUT_SIZE_SCALE)
    sprite.x = pos.x
    sprite.y = pos.y
    sprite.alpha = 0
    sprite.animationSpeed = 1 / 3
    sprite.eventMode = 'static'
    sprite.cursor = 'pointer'
    sprite.label = `Astronaut: ${astronaut.name}`
    
    return { sprite, spritesheet }
}

/**
 * Creates an astronaut sprite that orbits around the center of the viewport.
 */
export async function createAstronaut(astronaut: Astronaut): Promise<AstronautGraphic> {
    const container = new Container({ label: 'Astronaut' })
    const { sprite, spritesheet } = await createAnimatedAstronautSprite(astronaut)

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

    const animations = {
        greet: () => {
            return new Promise((res) => {
                const frames: string[] = []
                for (let i = 0; i <= 8; i++) {
                    frames.push(`astronauts ${i}.aseprite`)
                }
                sprite.textures = frames.map(name => spritesheet.textures[name])
                sprite.loop = false
                sprite.animationSpeed = 1 / 2
                sprite.gotoAndPlay(0)
                sprite.onComplete = () => {
                    res(null)
                }
            })
        },
        wave: (repeat: number = 2) => {
            return new Promise((res) => {
                const frames: string[] = []
                for (let i = 8; i <= 13; i++) {
                    frames.push(`astronauts ${i}.aseprite`)
                }
                let playCount = 0
                sprite.textures = frames.map(name => spritesheet.textures[name])
                sprite.animationSpeed = 1 / 3
                sprite.loop = false
                
                sprite.onComplete = () => {
                    playCount++
                    if (playCount < repeat) {
                        sprite.gotoAndPlay(0)
                        res(null)
                    }
                }
                
                sprite.gotoAndPlay(0)
            })
        },
        reset: () => {
            return new Promise((res) => {
                const frames: string[] = []
                for (let i = 8; i >= 0; i--) {
                    frames.push(`astronauts ${i}.aseprite`)
                }
                sprite.textures = frames.map(name => spritesheet.textures[name])
                sprite.loop = false
                sprite.animationSpeed = 1 / 1.5
                sprite.gotoAndPlay(0)
                sprite.onComplete = () => {
                    res(null)
                }
            })
        }
    }

    return {
        container,
        sprite,
        enterAnimation,
        animate,
        animations
    }
}