import gsap from 'gsap'
import { Spritesheet, Assets } from 'pixi.js'
import { Screen, StageAnimatedSprite } from '@pixellini/stagehand'
import { AstronautPerson, Craft } from '../api/FetchAstronauts.ts'

const ORBIT_SIZE = 200
const ASTRONAUT_SPRITESHEETS: Record<string, string> = {
    ISS: 'astronaut-iss',
    Tiangong: 'astronaut-tiangong'
}

export class Astronaut extends StageAnimatedSprite {
    private orbitState = { angle: 0 }
    public meta = {
        originalHeight: 0,
        originalWidth: 0,
        name: '',
        craft: '' as Craft
    }

    constructor(astronaut: AstronautPerson) {
        const type = ASTRONAUT_SPRITESHEETS[astronaut.craft] || ASTRONAUT_SPRITESHEETS.ISS
        const sheet = Assets.get<Spritesheet>(type)
        const initialFrames = [sheet.textures[`${type} 0`]]

        super(initialFrames)

        this.label = `Astronaut: ${astronaut.name}`
        
        this.x = Screen.center.x
        this.y = Screen.center.y
        this.alpha = 0
        this.scale.set(0.175)
        this.anchor.set(0.5)
        this.eventMode = 'static'
        this.cursor = 'pointer'
        this.meta = {
            originalHeight: this.height,
            originalWidth: this.width,
            name: astronaut.name,
            craft: astronaut.craft
        }
        this.sprites.sheet = sheet
        this.sprites.prefix = `${type} `
    }

    override onReady() {
        // --ANIMATIONS--
        this.sprites
            .add('greet', { frames: [0, 8], speed: 0.5 })
            .add('wave',  { frames: [8, 13], speed: 0.4, repeat: 2 })
            .add('idle',  { frames: [8, 0], speed: 0.67 })

        this.animator.add('enter').to(this, {
            onStart: () => {
                this.x = Screen.center.x
                this.y = Screen.center.y
            },
            x: () => Screen.center.x + Math.cos(this.orbitState.angle) * ORBIT_SIZE,
            y: () => Screen.center.y + Math.sin(this.orbitState.angle) * ORBIT_SIZE,
            alpha: 1,
            duration: 3,
            ease: 'power2.out'
        })

        this.animator.add('orbit').to(this, {
            duration: 120,
            repeat: -1,
            ease: 'none',
            onUpdate: () => {
                this.orbitState.angle += (Math.PI * 2) / (120 * 60)
                this.x = Screen.center.x + Math.cos(this.orbitState.angle) * ORBIT_SIZE
                this.y = Screen.center.y + Math.sin(this.orbitState.angle) * ORBIT_SIZE
            }
        })
    }

    /**
     * 360 degree orbit for 2 minutes.
     */
    public startOrbit(): void {
        gsap.to(this.orbitState, {
            angle: this.orbitState.angle + Math.PI * 2,
            duration: 120,
            ease: 'none',
            repeat: -1,
            onUpdate: () => {
                this.x = Screen.center.x + Math.cos(this.orbitState.angle) * ORBIT_SIZE
                this.y = Screen.center.y + Math.sin(this.orbitState.angle) * ORBIT_SIZE
            }
        })
    }

    public enter(angle: number): gsap.core.Timeline {
        this.orbitState.angle = angle

        return this.animator.play('enter')!
    }

    public async show() {
        await this.sprites.play('greet')
        await this.sprites.play('wave')
    }

    public idle() {
        this.sprites.play('idle')
    }

    public select(): void {
        gsap.to(this, {
            height: this.meta.originalHeight * 2,
            width: this.meta.originalWidth * 2
        })
    }

    public deselect(): void {
        gsap.to(this, {
            height: this.meta.originalHeight,
            width: this.meta.originalWidth,
            onStart: () => this.idle()
        })
    }
}