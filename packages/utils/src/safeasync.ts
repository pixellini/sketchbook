export interface SafeResponse<T = unknown, E = unknown> {
    data: T | null
    err: E | null
}

export async function safeAsync<T, E = unknown>(
    fn: () => Promise<T>
): Promise<SafeResponse<T, E>> {
    try {
        const data = await fn()
        return { data, err: null }
    } catch (error) {
        return { data: null, err: error as E }
    }
}

export interface SafeFetchResponse<T = unknown, E = unknown> extends SafeResponse<T, E> {
    response?: Response
}

export async function safeFetch<T, E = unknown>(url: string): Promise<SafeFetchResponse<T, E>> {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json() as T
        return { data, err: null, response }
    } catch (error) {
        return { data: null, err: error as E }
    }
}