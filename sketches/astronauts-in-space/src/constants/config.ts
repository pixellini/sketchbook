export const ASSET_PATH = '/astronauts/assets'
export const FONT_FAMILY = 'Tiny5' // https://fonts.google.com/specimen/Tiny5

export const MANIFEST = {
    bundles: [
        {
            name: 'start',
            assets: [
                { alias: 'astronaut-iss', src: `${ASSET_PATH}/spritesheets/astronaut-iss-spritesheet.json` },
                { alias: 'astronaut-tiangong', src: `${ASSET_PATH}/spritesheets/astronaut-tiangong-spritesheet.json` },
                { alias: 'earth', src: `${ASSET_PATH}/earth.png` },
                { alias: 'iss', src: `${ASSET_PATH}/iss.png` },
            ]
        },
        {
            name: 'lazy',
            assets: [
                { alias: 'mission-patch-iss', src: `${ASSET_PATH}/mission-patch-iss.png` },
                { alias: 'mission-patch-tiangong', src: `${ASSET_PATH}/mission-patch-tiangong.png` },
            ]
        }
    ]
}