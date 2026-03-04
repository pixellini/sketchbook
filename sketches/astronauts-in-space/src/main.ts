import { TextStyle } from 'pixi.js'
import { PixiApplication, AssetLoader } from '@pixellini/stagehand'
import { MainScene } from './scene/MainScene.ts'
import { FONT_FAMILY, MANIFEST } from './constants/config.ts'

/**
 * Wait for font to load before initialising,
 * then set the default font family for all text.
 */
async function setDefaultFont() {
    await document.fonts.load(`16px ${FONT_FAMILY}`)
    TextStyle.defaultTextStyle.fontFamily = FONT_FAMILY
}

async function main() {
    await setDefaultFont()
    await AssetLoader.init(MANIFEST)

    // Load eagerly — can't rely on SceneManager.loadSceneAssets
    // until the local stagehand changes are pushed to remote.
    await AssetLoader.loadBundle('start')
    AssetLoader.backgroundLoadBundle('lazy')

    const app = new PixiApplication()
    await app.init({
        debug: 0,
        // debugGrid: true,
        resizeTo: window,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(globalThis.devicePixelRatio, 2),
        autoDensity: true
    })

    app.play(new MainScene())
}

main()