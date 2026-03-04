import { Sprite, Text, Assets, Texture } from 'pixi.js'
import { gsap } from 'gsap'
import { Screen, StageContainer } from '@pixellini/stagehand'
import { PADDING_500, PADDING_100, FONT_XL, FONT_LG, PADDING_200 } from '@pixellini/design'
import { SPACE_STATIONS } from '../constants/shared.ts'
import { type AstronautPerson } from '../api/FetchAstronauts.ts'

const MISSION_PATCH_SIZE = 128
const MISSION_PATCH_URLS = {
    ISS: 'mission-patch-iss',
    TIANGONG: 'mission-patch-tiangong',
}

export class MissionPatch extends StageContainer {
    private sprite: Sprite
    private nameText: Text
    private stationText: Text
    private timeline: gsap.core.Timeline | null = null

    constructor(astronaut: AstronautPerson) {
        super({ label: 'Mission Patch' })

        this.sprite = new Sprite()
        this.sprite.anchor.set(0, 0)
        this.sprite.width = MISSION_PATCH_SIZE
        this.sprite.height = MISSION_PATCH_SIZE
        
        this.nameText = new Text({
            text: astronaut.name,
            anchor: { x: 0, y: 1 },
            style: { fontSize: FONT_XL, fill: 0xffffff },
        })
        this.nameText.position.set(MISSION_PATCH_SIZE + PADDING_500, (MISSION_PATCH_SIZE / 2))

        this.stationText = new Text({
            text: astronaut.craft,
            anchor: { x: 0, y: 0 },
            style: { fontSize: FONT_LG, fill: 0xcccccc },
        })
        this.stationText.position.set(MISSION_PATCH_SIZE + PADDING_500, (MISSION_PATCH_SIZE / 2))

        this.addChild(this.sprite, this.nameText, this.stationText)

        this.alpha = 0
        this.updatePosition()

        this.loadTexture(astronaut.craft)
    }

    private async loadTexture(craft: string) {
        const isInternational = craft === SPACE_STATIONS.ISS
        const alias = isInternational ? MISSION_PATCH_URLS.ISS : MISSION_PATCH_URLS.TIANGONG
        
        try {
            const texture = await Assets.load<Texture>(alias)
            this.sprite.texture = texture
            
            this.sprite.width = MISSION_PATCH_SIZE
            this.sprite.height = MISSION_PATCH_SIZE
        } 
        catch (e) {
            console.warn('Failed to load mission patch', e)
        }
    }

    /**
     * Position logic separated so it can be called on resize
     */
    public updatePosition() {
        this.position.set(
            PADDING_500, 
            Screen.height - MISSION_PATCH_SIZE - PADDING_500
        )
    }

    public spawn(): void {
        const basePos = this.x
        const enterPos = this.x - PADDING_200

        // Kill existing animation if any.
        if (this.timeline) this.timeline.kill()

        this.timeline = gsap.timeline()
        .set(this, {
            alpha: 0,
            x: enterPos
        })
        .to(this, {
            keyframes: [
                { alpha: 1, x: basePos, ease: 'power1.out', duration: 0.5 },
                { y: this.y + PADDING_100, ease: 'power1.inOut', yoyo: true, repeat: -1, duration: 2 }
            ]
        })
    }

    public async dismiss(): Promise<void> {
        if (this.timeline) this.timeline.kill()

        await gsap.to(this, {
            alpha: 0,
            duration: 0.25,
            ease: 'power1.inOut',
        })
        
        this.destroy({ children: true })
    }
}