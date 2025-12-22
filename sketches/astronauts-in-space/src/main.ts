import { Application, TextStyle } from 'pixi.js'
import { gsap } from 'gsap'
import { mainScene } from './scene/main.scene.ts'


if (globalThis) {
    // @ts-ignore: PixiPlugin is expected to be found on the window object.
    gsap.registerPlugin(globalThis.PixiPlugin)
}

/**
 * Wait for font to load before initialising,
 * then set the default font family for all text.
 */
const FONT_FAMILY = 'Tiny5' // https://fonts.google.com/specimen/Tiny5
async function setDefaultFont() {
    await document.fonts.load(`16px ${FONT_FAMILY}`)
    TextStyle.defaultTextStyle.fontFamily = FONT_FAMILY
}

async function createApp() {
    const app = new Application()
    await app.init({
        // background: COLORS.SPACE_DARK,
        antialias: true,
        autoDensity: true,
        resolution: globalThis.devicePixelRatio || 1,
        resizeTo: window,
    })

    // Stop the default render loop; we'll drive it manually via gsap.ticker.
    app.stop()
    gsap.ticker.add(() => {
        app.render()
    })

    document
        .getElementById('pixi-container')!
        .appendChild(app.canvas)

    return app
}


(async () => {
    await setDefaultFont()
    const app = await createApp()
    await mainScene(app)
})()
