/// <reference lib="dom" />
import { Application, Renderer, Graphics, FillGradient, TextStyle } from 'pixi.js'
import { gsap } from 'gsap'
import { createParallaxEffect, ParallaxScene } from '@pixellini/pixi-utils'
import { AstronautPerson, fetchAstronauts } from '../api/fetch-astronauts.ts'
import { Astronaut, AstronautGraphic, createAstronaut } from '../graphics/astronaut.ts'
import { createStar } from '../graphics/star.ts'
import { createEarth } from '../graphics/earth.ts'
import { createShootingStar } from '../graphics/shootingstar.ts'
import { createMissionPatch, MissionPatchGraphic } from '../graphics/missionpatch.ts'
import { COLORS } from '../constants/shared.ts'
// import { createSpaceStations } from '../graphics/spacestation.ts'

// Updates the quantity of stars in the background of the scene.
const STAR_DENSITY = 10
// Configures how many shooting star animations run in parallel.
const SHOOTING_STAR_PARALLELISM = 2
const SELECTED_ASTRONAUT_SCALE_AMOUNT = 1.8
const SELECTED_ASTRONAUT_TWEEN_DURATION = 0.3
// Scene state.
interface State {
    missionpatch: MissionPatchGraphic | null
    astronaut: AstronautGraphic | null
}
const state: State = {
    missionpatch: null,
    astronaut: null
}

/**
 * Initialises and runs the main astronaut scene with parallax effects.
 */
export async function mainScene(app: Application<Renderer>) {
    const scene = await createScene(app)
    const parallax = createSceneParallax(app) 
    
    const starCount = Math.round((globalThis.innerHeight * globalThis.innerWidth * (STAR_DENSITY / 3000)))
    for (let i = 0; i < starCount; i++) {
        const star = await createStar()
        parallax.addToLayer(star.size - 1, star.sprite)
    }

    const earth = await createEarth()
    parallax.addToLayer(3, earth.sprite)

    // Note: Not going to show the space stations until I've made sprites for them.
    // const stations = await createSpaceStations()
    // stations.forEach(station => {
    //     parallax.addToLayer(3, station.sprite)
    //     station.animate()
    // })

    const astronauts = await fetchAstronauts()
    const astronautGraphicList: AstronautGraphic[] = []
    const astronautTimeline = gsap.timeline({
        paused: true,
        onComplete () {
            astronautGraphicList.forEach(astronaut => astronaut.animate())
        }
    })

    // Add the astronauts to the scene.
    if (astronauts) {
        for(const [index, data] of astronauts.entries()) {
            const details: Astronaut = { name: data.Name, craft: data.Craft }
            const astronaut = await createAstronaut(details)
            const step = (Math.PI * 2) / astronauts.length
            const direction = index * step

            // Stagger entrance animations by 0.1s per astronaut.
            astronautTimeline.add(astronaut.enterAnimation(direction, 0), index * 0.1)
            astronautGraphicList.push(astronaut)

            parallax.addToLayer(4, astronaut.container)

            astronaut.sprite.on('pointertap', async () => {
                if (state.astronaut) {
                    deselectAstronaut(state.astronaut)
                    hideMissionPatch()
                }

                // Check if it's the astronaut that's already been selected.
                if (state.astronaut?.sprite.label === astronaut.sprite.label) {
                    state.astronaut = null
                    state.missionpatch = null
                }
                else {
                    await selectAstronaut(astronaut)
                    await showMissionPatch(app, details)
                }
            })
        }
    }

    astronautTimeline.play()

    for (let i = 0; i < SHOOTING_STAR_PARALLELISM; i++) {
        runShootingStars(app, parallax)
    }

    gsap.ticker.add(() => {
        parallax.update()
    })
}

function createScene(app: Application<Renderer>) {
    const gradient = new FillGradient({
        type: 'radial',
        center: { x: 0.5, y: 0.5 },
        innerRadius: 0,
        outerCenter: { x: 0.5, y: 0.5 },
        outerRadius: 0.5,
        colorStops: [
            { offset: 0,   color: COLORS.SPACE_GRADIENT_CENTER }, // center
            { offset: 0.5, color: COLORS.SPACE_GRADIENT_MID }, // mid
            { offset: 1,   color: COLORS.SPACE_GRADIENT_EDGE }  // edge
        ],
        textureSpace: 'local'
    })
    
    const bg = new Graphics();
    bg.fill(gradient)
        .rect(0, 0, app.renderer.width, app.renderer.height)
        .fill()

    app.stage.addChildAt(bg, 0)
}

function createSceneParallax(app: Application) {
    const parallax = createParallaxEffect({
        layers: [
            // Stars
            { strength: 0.005, easeFactor: 0.05 },
            { strength: 0.01, easeFactor: 0.05 },
            { strength: 0.015, easeFactor: 0.05 },
            // Earth & Astronauts
            { strength: 0.04, easeFactor: 0.05 },
            { strength: 0.05, easeFactor: 0.05 },
        ]
    })

    parallax.layers.forEach(layer => {
        app.stage.addChild(layer.container)
    })

    return parallax
}

/**
 * Recursively spawns shooting stars with random delays.
 */
function runShootingStars(app: Application, parallax: ParallaxScene) {
    const shootingStar = createShootingStar()
    const delay = gsap.utils.random(1, 5) * 1000
    parallax.addToLayer(0, shootingStar.sprite)

    setTimeout(() => {
        shootingStar.animate(() => {
            parallax.remove(shootingStar.sprite)
            runShootingStars(app, parallax)
        })
    }, delay)
}

async function selectAstronaut(astronaut: AstronautGraphic) {
    // // Reset previous astronaut's scale and scale up new one in parallel.
    // if (state.astronaut) {
    //     const prevOriginalScale = state.astronaut.sprite.scale.x / SELECTED_ASTRONAUT_SCALE_AMOUNT
    //     gsap.to(state.astronaut.sprite.scale, {
    //         x: prevOriginalScale,
    //         y: prevOriginalScale,
    //         duration: SELECTED_ASTRONAUT_TWEEN_DURATION,
    //         onStart: () => {
    //             state.astronaut!.animations.reset()
    //         }
    //     })
    // }
    
    await gsap.to(astronaut.sprite.scale, {
        x: astronaut.meta.originalScale * SELECTED_ASTRONAUT_SCALE_AMOUNT,
        y: astronaut.meta.originalScale * SELECTED_ASTRONAUT_SCALE_AMOUNT,
        duration: SELECTED_ASTRONAUT_TWEEN_DURATION,
        onStart: () => {
            // GSAP doesn't allow async/await directly on the lifecycle hook.
            // This is a workaround to ensure the animations run sequentially.
            (async function animate () {
                await astronaut.animations.greet()
                await astronaut.animations.wave()
            })()
        }
    })
    state.astronaut = astronaut
}

function deselectAstronaut(astronaut?: AstronautGraphic | null) {
    if (!astronaut) return

    gsap.to(astronaut.sprite.scale, {
        x: astronaut.meta.originalScale,
        y: astronaut.meta.originalScale,
        duration: SELECTED_ASTRONAUT_TWEEN_DURATION,
        onStart: () => {
            astronaut.animations.reset()
        }
    })
}

async function showMissionPatch(app: Application<Renderer>, astronautDetails: Astronaut) {
    state.missionpatch = await createMissionPatch(astronautDetails)
    app.stage.addChild(state.missionpatch.sprite)
    state.missionpatch.show()
}

function hideMissionPatch() {
    if (state.missionpatch) {
        state.missionpatch.destroy()
    }
}