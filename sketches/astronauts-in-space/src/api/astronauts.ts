/**
 * Response structure from the astronaut API.
 */
interface AstronautApi {
    message: string,
    number: number,
    people: {
        name: string,
        craft: string
    }[]
}

const ASTRONAUT_DATA_SUB_PATH = 'astronauts/assets/astronauts.json'
// Dev mode fetches from CDN, and production uses relative path.
const ASTRONAUT_DATA_URL = `${import.meta.env.DEV ? 'https://fun.pixellini.com' : ''}/${ASTRONAUT_DATA_SUB_PATH}`

/**
 * Fetches the list of astronauts currently in space from the API.
 */
export async function fetchAstronauts() {
    try {
        const response = await fetch(ASTRONAUT_DATA_URL)
        if (!response.ok) {
            throw new AstronautApiError(
                `Failed to fetch astronaut data: ${response.statusText}`,
                response.status
            )
        }
        const data = await response.json() as AstronautApi

        return data?.people
    } catch (error) {
        console.log(error)
    }
}

/**
 * Custom error for astronaut API failures.
 */
class AstronautApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message)
        this.name = 'AstronautApiError'
    }
}