import { config } from 'snips-toolkit'
import { directionsRequest } from './index'

interface Context {
    originName?: string,
    destinationName?: string
}

export async function calculateRoute (origin: string, destination: string, travelMode: string, departureTime?: number, arrivalTime?: number) {
    let query = {
        origin,
        destination,
        mode: travelMode,
        transit_mode: '',
        departure_time: departureTime || 'now',
        arrival_time: arrivalTime,
        units: config.get().unitSystem,
        region: config.get().currentRegion,
        language: config.get().locale
    }

    if (travelMode === 'bus' || travelMode === 'train') {
        query = {
            ...query,
            mode: 'transit',
            transit_mode: travelMode
        }
    }

    const context: Context = {}
    const results = await directionsRequest
        .query(query)
        .options({ origin, destination, query, context })
        .get()
        .json()
        .catch(error => {
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        })
    
    if (results) {
        if (results.status === 'ZERO_RESULTS' || results.status === 'NOT FOUND') {
            throw new Error('place')
        }
    } else {
        throw new Error('APIResponse')
    }

    if (context.originName) {
        results.routes[0].legs[0].start_address_name = context.originName
    }
    if (context.destinationName) {
        results.routes[0].legs[0].end_address_name = context.destinationName
    }

    return results
}
