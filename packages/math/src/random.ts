/**
 * Returns an integer in the range [0, value).
 */
export function random(value: number) {
    return Math.floor(Math.random() * value)
}

/**
 * Returns an integer in the inclusive range [min, max], regardless of argument order.
 */
export function randomBetween(min: number, max: number) {
    const low = Math.min(min, max)
    const high = Math.max(min, max)
    return Math.floor(Math.random() * (high - low + 1)) + low
}