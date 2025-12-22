aseprite -b ./design/astronauts.aseprite \
    --scale 8 \
    --sheet ./public/assets/spritesheets/astronaut-${CRAFT}-spritesheet.png \
    --data ./public/assets/spritesheets/astronaut-${CRAFT}-spritesheet.json \
    --format json \
    --filename-format "astronaut-${CRAFT} {frame}"