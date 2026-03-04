import { Assets, Texture } from 'pixi.js'
import { gsap } from 'gsap'
import { Screen, StageSprite } from '@pixellini/stagehand'

/**
 * The resting opacity. 
 * This is to give the illusion that the station is distant in the background.
 */
const SPRITE_ALPHA = 0.2
/**
 * I use a small base size to reinforce the scale of the station 
 * relative to the viewport.
 */
const SPRITE_SIZE = 36
const SPRITE_SIZE_SELECTED = SPRITE_SIZE * 3

/**
 * Represents a clickable space station in the background.
 */
export class Station extends StageSprite {
    private isClickable: boolean = false
    private isSelected: boolean = false
    private textureAlias: string

    constructor(name: string, textureAlias: string) {
        super()

        this.label = `Space Station: ${name}`
        this.textureAlias = textureAlias

        this.anchor.set(0.5)
        this.width = SPRITE_SIZE
        this.height = SPRITE_SIZE
        this.alpha = 0
        this.zIndex = 1000

        this.x = Screen.width
        this.y = Screen.height

        this.eventMode = 'static'
        this.cursor = 'pointer'
        this.on('pointertap', this.toggle)
    }

    public override async onStart() {
        try {
            const texture = await Assets.load<Texture>(this.textureAlias)
            this.texture = texture
            
            // Re-apply sizes in case texture load resets them
            this.width = this.isSelected ? SPRITE_SIZE_SELECTED : SPRITE_SIZE
            this.height = this.isSelected ? SPRITE_SIZE_SELECTED : SPRITE_SIZE
        } catch (e) {
            console.warn(`[Station] Failed to load texture: ${this.textureAlias}`, e)
        }
    }

    /**
     * Triggers the entrance animation.
     */
    public enter(): gsap.core.Tween {
        return gsap.to(this, {
            alpha: SPRITE_ALPHA,
            duration: 1,
            delay: 3, // Kept the delay from your original logic
            onComplete: () => {
                this.isClickable = true
            }
        })
    }

    /**
     * Handles the expand/contract interaction.
     * I used an arrow function here to preserve the `this` context automatically.
     */
    private toggle = (): void => {
        if (!this.isClickable) return

        this.isSelected = !this.isSelected
        const targetSize = this.isSelected ? SPRITE_SIZE_SELECTED : SPRITE_SIZE

        gsap.to(this, {
            width: targetSize,
            height: targetSize,
            alpha: this.isSelected ? SPRITE_ALPHA : 1, // Brighten when selected
            duration: 2,
            ease: 'power4.out'
        })
    }
}