/// <reference lib="dom" />
import { Application, Graphics, FillGradient } from 'pixi.js'
import { gsap } from 'gsap'
import { createParallaxEffect, ParallaxScene } from '@pixellini/pixi-utils'
import { fetchAstronauts } from '../api/astronauts.ts'
import { AstronautSprite, createAstronaut } from '../graphics/astronaut.ts'
import { createStar } from '../graphics/star.ts'
import { createEarth } from '../graphics/earth.ts'
import { createShootingStar } from '../graphics/shootingstar.ts'
import { COLORS } from '../constants/colors.ts'
// import { createSpaceStations } from '../graphics/spacestation.ts'

const STAR_DENSITY = 10 // this is a nicer number to change

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

/**
 * Initialises and runs the main astronaut scene with parallax effects.
 */
export async function mainScene() {
    const app = new Application()
    await app.init({
        background: COLORS.SPACE_DARK,
        antialias: true,
        autoDensity: true,
        resolution: globalThis.devicePixelRatio || 1,
        resizeTo: window,
    })

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

    // Stop the default render loop; we'll drive it manually via gsap.ticker.
    app.stop()

    document
        .getElementById('pixi-container')!
        .appendChild(app.canvas)

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
    const astronautSpriteList: AstronautSprite[] = []
    const astronautTimeline = gsap.timeline({
        paused: true,
        onComplete () {
            astronautSpriteList.forEach(astronaut => astronaut.animate())
        }
    })

    if (astronauts) {
        for(const [index, data] of astronauts.entries()) {
            const astronaut = await createAstronaut(data)
            const step = (Math.PI * 2) / astronauts.length
            const direction = index * step

            // Stagger entrance animations by 0.1s per astronaut.
            astronautTimeline.add(astronaut.enterAnimation(direction, 0), index * 0.1)
            astronautSpriteList.push(astronaut)

            parallax.addToLayer(4, astronaut.sprite)
        }
    }

    astronautTimeline.play()

    runShootingStars(app, parallax)
    runShootingStars(app, parallax)

    gsap.ticker.add(() => {
        parallax.update()
        app.render()
    })
}