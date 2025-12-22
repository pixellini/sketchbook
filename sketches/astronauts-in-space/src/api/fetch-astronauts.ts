import { safeFetch } from '@pixellini/utils'
import { SPACE_STATIONS } from '../constants/shared.ts'

/**
 * Response structure from the astronaut API.
 */
export interface AstronautApi {
    message: string,
    number: number,
    people: AstronautPerson[]
}

export interface AstronautPerson {
    Name: string,
    Craft: typeof SPACE_STATIONS[keyof typeof SPACE_STATIONS]
}

const ASTRONAUT_DATA_SUB_PATH = 'astronauts/assets/astronauts.json'
// Dev mode fetches from CDN, and production uses relative path.
const ASTRONAUT_DATA_URL = `${import.meta.env.DEV ? 'https://fun.pixellini.com' : ''}/${ASTRONAUT_DATA_SUB_PATH}`

/**
 * Fetches the list of astronauts currently in space from the API.
 */
export async function fetchAstronauts(): Promise<AstronautPerson[]> {
    const { data, err } = await safeFetch<AstronautApi, AstronautApiError>(ASTRONAUT_DATA_URL)
    if (err) {
        // TODO: Show an error state. Need to think of some ideas...
        console.error(err)
        return []
    }
    
    if (!data?.people) {
        console.error('API did not return astronauts')
        return []
    }

    return data?.people
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