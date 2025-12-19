import { Container } from 'pixi.js'
import type { ContainerChild, Graphics, Sprite } from 'pixi.js'
import { gsap } from 'gsap'
import { centerPosition, createCenterPosition, createPosition } from './position.ts'

/**
 * Renderable that can be placed on a parallax layer.
 */
export type ParallaxObject = Sprite | Graphics | Container<ContainerChild>

/**
 * Configures how a single layer reacts to pointer movement.
*/
export interface ParallaxLayerConfig {
    /** Multiplier for how far the layer moves relative to the pointer. */
    strength: number
    /** Smoothing factor for easing toward the target offset (0-1). */
    easeFactor: number
}

/**
 * Single parallax layer with its own container and easing behavior.
 */
export interface ParallaxLayer {
    /** The PixiJS container holding all renderables in this layer. */
    container: Container
    /** Adds a child renderable to this layer's container. */
    add: (child: ContainerChild) => void
    /** Updates the layer's position based on the parallax offset. */
    update: (offsetX: number, offsetY: number) => void
}

/**
 * Public API for a parallax scene: holds layers and exposes mutation/update hooks.
 */
export interface ParallaxScene {
    /** All parallax layers in back-to-front render order. */
    layers: ParallaxLayer[]
    /** Adds a sprite or graphic to a specific layer by index. */
    addToLayer: (layerIndex: number, sprite: ParallaxObject) => void
    /** Destroys and removes a sprite or graphic from the scene. */
    remove: (sprite: ParallaxObject) => void
    /** Updates all layer positions based on current pointer offset. */
    update: () => void
}

/**
 * Builds a single parallax layer with easing behaviour based on the provided config.
 */
function createParallaxLayer(config: ParallaxLayerConfig) {
    const container = new Container({ label: 'Parallax Layer' })
    const target = createPosition()

    function add(child: ContainerChild) {
        container.addChild(child)
    }

    function update(offsetX: number, offsetY: number) {
        target.x = offsetX * config.strength
        target.y = offsetY * config.strength
        container.x += (target.x - container.x) * config.easeFactor
        container.y += (target.y - container.y) * config.easeFactor
    }

    return {
        container,
        add,
        update
    }
}

/**
 * Configuration for the parallax effect: ordered list of layer configs from back to front.
 */
export interface ParallaxConfig {
    layers: ParallaxLayerConfig[]
}

/**
 * Creates a multi-layer parallax scene wired to pointer movement and resize events.
 */
export function createParallaxEffect(config: ParallaxConfig): ParallaxScene {
    const layers = config.layers.map(c => createParallaxLayer(c))
    const center = createCenterPosition()
    const mouse = createPosition()
    const target = createPosition()

    /**
     * Smoothly follows pointer movement to establish the parallax target.
     */
    globalThis.addEventListener('mousemove', (e) => {
        target.x = e.clientX
        target.y = e.clientY
        
        gsap.to(mouse, {
            x: target.x,
            y: target.y,
            duration: 5,
            ease: 'power4.out'
        })
    })

    /**
     * Re-centers the scene when the viewport size changes.
     */
    globalThis.addEventListener('resize', () => {
        centerPosition(center)
    })

    /**
     * Adds a sprite/graphic to a specific parallax layer index.
     */
    function addToLayer(layerIndex: number, sprite: ParallaxObject) {
        const layer = layers[layerIndex]
        if (layer && sprite) {
            layer.add(sprite)
        }
    }

    /**
     * Destroys and removes a sprite/graphic from the scene.
     */
    function remove(sprite: ParallaxObject) {
        if (sprite) {
            sprite.destroy()
        }
    }

    /**
     * Updates all layers relative to center and smoothed pointer position.
     */
    function update() {
        const offsetX = -(mouse.x - center.x)
        const offsetY = -(mouse.y - center.y)

        layers.forEach(layer => {
            layer.update(offsetX, offsetY)
        })
    }

    return {
        layers,
        addToLayer,
        remove,
        update
    }
}