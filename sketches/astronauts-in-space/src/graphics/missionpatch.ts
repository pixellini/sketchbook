import { Assets, Sprite, Text, Container } from 'pixi.js'
import { gsap } from 'gsap'
import { PADDING_500, PADDING_100, FONT_XL, FONT_LG, PADDING_200 } from '@pixellini/design'
import { SPACE_STATIONS } from '../constants/shared.ts'
import { type Astronaut } from './astronaut.ts'

const MISSION_PATCH_SIZE = 128 // px
const MISSION_PATCH_FADE_DURATION = 0.5 // seconds
const MISSION_PATCH_URLS = {
    ISS: '/astronauts/assets/mission-patch-iss.png',
    TIANGONG: '/astronauts/assets/mission-patch-tiangong.png',
}

export interface MissionPatchGraphic {
    sprite: Container,
    destroy: () => Promise<void>
    show: () => void
}

/**
 * Creates a floating badge that contains the Astronaut's details.
 */
export async function createMissionPatch(astronaut: Astronaut): Promise<MissionPatchGraphic> {
    const container = new Container({ label: 'Mission Patch' })
    const isInternational = astronaut.craft === SPACE_STATIONS.ISS
    const imageUrl = isInternational ? MISSION_PATCH_URLS.ISS : MISSION_PATCH_URLS.TIANGONG

    const texture = await Assets.load(imageUrl)
    const badge = new Sprite(texture)
    badge.anchor.set(0, 0)
    badge.width = MISSION_PATCH_SIZE
    badge.height = MISSION_PATCH_SIZE

    const nameText = new Text({
        text: astronaut.name,
        anchor: { x: 0, y: 1 },
        style: {
            fontSize: FONT_XL,
            fill: 0xffffff,
        },
    })
    nameText.position.set(MISSION_PATCH_SIZE + PADDING_500, (MISSION_PATCH_SIZE / 2))

    const stationText = new Text({
        text: astronaut.craft,
        anchor: { x: 0, y: 0 },
        style: {
            fontSize: FONT_LG,
            fill: 0xcccccc,
        },
    })
    stationText.position.set(MISSION_PATCH_SIZE + PADDING_500, (MISSION_PATCH_SIZE / 2))

    container.addChild(badge)
    container.addChild(nameText)
    container.addChild(stationText)
    
    container.position.set(
        PADDING_500, 
        globalThis.innerHeight - MISSION_PATCH_SIZE - PADDING_500
    )
    container.alpha = 0

    const basePos = container.x
    const enterPos = container.x - PADDING_200
    
    const tl = gsap.timeline()
    function show() {
        const startLabel = 'start'
        tl.fromTo(container, {
            alpha: 0,
            x: enterPos
        }, {
            alpha: 1,
            x: basePos,
            ease: 'power2.out',
            duration: MISSION_PATCH_FADE_DURATION,
        }, startLabel)
        .fromTo(container, {
            y: container.y - PADDING_100,
        }, {
            y: container.y + PADDING_100,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
            duration: 2
        }, startLabel)
    }

    async function destroy() {
        tl.kill()
        await gsap.fromTo(container, {
            alpha: 1,
            x: basePos
        }, {
            alpha: 0,
            x: enterPos,
            duration: MISSION_PATCH_FADE_DURATION,
            onComplete: () => {
                container.destroy()
            }
        })
    }

    return {
        sprite: container,
        show,
        destroy
    }
}