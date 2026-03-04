import gsap from 'gsap'
import { MathUtils, ParallaxContainer, Scene, Screen, SceneUtils, type ParallaxLayerConfig } from '@pixellini/stagehand'
import { Star } from '../sprites/Star.ts'
import { Earth } from '../sprites/Earth.ts'
import { FillGradient, Graphics, Point } from 'pixi.js'
import { Astronaut } from '../sprites/Astronaut.ts'
import { fetchAstronauts } from '../api/FetchAstronauts.ts'
import { COLORS } from '../constants/shared.ts'
import { ShootingStar } from '../sprites/ShootingStar.ts'
import { MissionPatch } from '../sprites/MissionPatch.ts'

export class MainScene extends Scene {
    public override title: string = 'Main Scene'
    public override assets = { bundle: 'start', preload: ['lazy'] }

    private readonly starCount = Math.min((globalThis.innerWidth * globalThis.innerHeight) / 500, 3000)
    // How many shooting stars will run in parallel of each other.
    private readonly shootingStarCount = 3

    private astronauts: Astronaut[] = []
    private background!: Graphics
    private selectedAstronaut: Astronaut | null = null
    private currentPatch: MissionPatch | null = null

    private parallax: ParallaxContainer = new ParallaxContainer({
        layers: [
            // Stars & Shooting Stars
            { strength: 0.2, easeFactor: 5 },
            { strength: 0.3, easeFactor: 5 },
            { strength: 0.4, easeFactor: 5 },
            { strength: 0.5, easeFactor: 5 },
            // Earth
            { strength: 4, easeFactor: 5 },
            // Astronauts
            { strength: 6, easeFactor: 5 },
        ]
    })

    constructor() {
        super()
    }

    // --SETUP--

    override onCreate() {
        this.parallax.layers.forEach(layer => {
            layer.alpha = 0
        })
        this.parallax.addToLayer(4, new Earth())
        this.addChild(this.parallax)
        this.createBackground()
    }

    override async onStart() {
        try {
            const astronauts = await fetchAstronauts()
            this.astronauts = astronauts.map(data => new Astronaut(data))
        }
        catch (error) {
            console.error(error)
        }

        this.astronauts.forEach(a => {
            this.parallax.addToLayer(5, a)
            a.on('pointertap', () => this.onAstronautClick(a))
        })
    }

    override onReady() {
        this.timeline
            .call(() => this.spawnStars())
            .call(() => this.spawnShootingStarAndLoop())
            .add(this.animEnterScene())
            .add(this.animSpawnAstronauts())
    }

    private createBackground() {
        const spaceGradient = new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0,
            outerCenter: { x: 0.5, y: 0.5 },
            outerRadius: 0.5,
            colorStops: [
                { offset: 0,   color: COLORS.SPACE_GRADIENT_CENTER }, // center
                { offset: 0.25, color: COLORS.SPACE_GRADIENT_MID2 }, // mid
                { offset: 0.45, color: COLORS.SPACE_GRADIENT_MID }, // mid
                { offset: 0.75, color: COLORS.SPACE_GRADIENT_MID3 }, // mid
                { offset: 1,   color: COLORS.SPACE_GRADIENT_EDGE }  // edge
            ],
            textureSpace: 'local'
        })

        this.background = new Graphics()
            .clear()
            .rect(0, 0, Screen.width, Screen.height)
            .fill(spaceGradient)
        this.background.alpha = 0

        if (this.children.length > 0) {
            // Add to bottom of stack
            this.addChildAt(this.background, 0)
        } else {
            this.addChild(this.background)
        }
    }

    // --EVENTS--

    private async onAstronautClick(astronaut: Astronaut) {
        const previous = this.selectedAstronaut

        if (previous) {
            previous.deselect()
        }

        // Toggle off if the same astronaut is tapped again.
        if (previous?.uid === astronaut.uid) {
            this.selectedAstronaut = null
        } else {
            this.selectedAstronaut = astronaut
            astronaut.select()
            astronaut.show()
        }

        await this.swapMissionPatch(this.selectedAstronaut)
    }

    private async swapMissionPatch(astronaut: Astronaut | null) {
        if (this.currentPatch) {
            await this.currentPatch.dismiss()
            this.currentPatch = null
        }

        if (astronaut) {
            this.currentPatch = new MissionPatch({
                name: astronaut.meta.name,
                craft: astronaut.meta.craft
            })
            this.addChild(this.currentPatch)
            this.currentPatch.spawn()
        }
    }

    // --ANIMATIONS--

    private spawnStars() {
        for (let i = 0; i < this.starCount; i++) {
            const randomPos = SceneUtils.randomPos()
            const star = new Star(randomPos)

            const layer = MathUtils.randomInt(0, 3)
            this.parallax.addToLayer(layer, star)
        }
    }

    private spawnShootingStarAndLoop(): void {
        for (let i = 0; i < this.shootingStarCount; i++) {
            const delay = MathUtils.randomInt(1, 5)
    
            gsap.delayedCall(delay, () => {
                if (this.destroyed) return
    
                const shootingStar = new ShootingStar()
                this.parallax.addToLayer(3, shootingStar)
            })
        }
    }

    private animEnterScene(): gsap.core.Timeline {
        // TODO: Add an alpha level for the Parallax config instead of setting it here.
        const alphaLevels = [0.35, 0.45, 0.55, 0.55, 1, 1]
        return gsap.timeline()
        .to(this.background, {
            alpha: 1,
            duration: 0.5,
        }, 0)
        .to(this.parallax.layers, {
            alpha: (i) => alphaLevels[i],
            duration: 1,
            ease: 'power2.inOut',
            stagger: 0.25,
        }, 0)
    }

    private animSpawnAstronauts() {
        const tl = gsap.timeline({
            onComplete: () => {
                this.astronauts.forEach((astronaut, index) => {
                    astronaut.startOrbit()
                })
            }
        })

        this.astronauts.forEach((astronaut, index) => {
            const angle = (Math.PI * 2) / this.astronauts.length * index
            tl.add(astronaut.enter(angle), index * 0.05)
        })

        return tl
    }

    // private animEnterSpaceStations() {

    // }
}