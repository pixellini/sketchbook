import { Assets, Texture } from 'pixi.js'
import { StageSprite } from '@pixellini/stagehand'

export class Earth extends StageSprite {
    constructor() {
        const texture = Assets.get<Texture>('earth')
        super(texture)

        this.label = 'Earth'
        this.zIndex = 200
        this.anchor.set(0.5)
        this.position.set(globalThis.innerWidth / 2, globalThis.innerHeight / 2)
        this.scale.set(0.25)
        
        this.alpha = 1
    }
}