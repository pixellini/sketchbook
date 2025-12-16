/// <reference lib="dom" />
import { random } from '@pixellini/math'

/**
 * Basic 2D coordinate.
 */
export interface Position {
    x: number
    y: number
}

/**
 * Creates a position with optional x/y (defaults to 0).
 */
export function createPosition(x: number = 0, y: number = 0): Position {
    return {
        x,
        y
    }
}

/**
 * Creates a position at the current viewport center.
 */
export function createCenterPosition() {
    return createPosition(
        // x
        globalThis.innerWidth / 2,
        // y
        globalThis.innerHeight / 2
    )
}

/**
 * Mutates a position to the current viewport center.
 */
export function centerPosition(p: Position) {
    p.x = globalThis.innerWidth / 2
    p.y = globalThis.innerHeight / 2
}

/**
 * Creates a position at a random viewport coordinate.
 */
export function createRandomPosition() {
    const x = random(globalThis.innerWidth)
    const y = random(globalThis.innerHeight)
    return createPosition(x, y)
}