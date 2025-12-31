/** MATH **/
export function sum(arr: number[]) {
    return arr.reduce((prev, curr) => prev + curr, 0)
}

/** RANDOM **/
/**
 * Returns a random floating number in the range og [0, value)
 */
export function random(value: number = 1) {
    return Math.random() * value
}

/**
 * Returns a random integer in the range [0, value).
 */
export function randomInt(value: number) {
    return Math.floor(random(value))
}

/**
 * Returns a random integer in the inclusive range [min, max].
 */
export function randomIntBetween(min: number, max: number) {
    const low = Math.min(min, max)
    const high = Math.max(min, max)
    return Math.floor(Math.random() * (high - low + 1)) + low
}