import { gsap } from 'gsap'
import { mainScene } from './scene/main-scene.ts'


if (globalThis) {
    // @ts-ignore: PixiPlugin is expected to be found on the window object.
    gsap.registerPlugin(globalThis.PixiPlugin)
}


(async () => {
    await mainScene()
})()
