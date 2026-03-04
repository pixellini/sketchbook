import { safeFetch } from '@pixellini/utils'
import { SPACE_STATIONS } from '../constants/shared.ts'

export type Craft = typeof SPACE_STATIONS[keyof typeof SPACE_STATIONS]

/**
 * Response structure from the astronaut API.
 */
export interface AstronautApi {
    message: string,
    number: number,
    people: AstronautPersonRaw[]
}

export interface AstronautPersonRaw {
    Name: string,
    Craft: Craft
}

export interface AstronautPerson {
    name: string,
    craft: Craft
}

const ASTRONAUTS_DATA_URL = '/astronauts/assets/astronauts.json'

/**
 * Fetches the list of astronauts currently in space from the API.
 */
export async function fetchAstronauts(): Promise<AstronautPerson[]> {
    const { data, err } = await safeFetch<AstronautApi, AstronautApiError>(ASTRONAUTS_DATA_URL)
    if (err) {
        // TODO: Show an error state. Need to think of some ideas...
        console.error(err)
        return []
    }
    
    if (!data?.people || data.people.length === 0) {
        console.error('API did not return astronauts')
        return []
    }

    return data?.people.map(a => ({ name: a.Name, craft: a.Craft }))
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