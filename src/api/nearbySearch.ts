import { config } from 'snips-toolkit'
import { placesRequest } from './index'

export async function nearbySearch (coords, name) {
    const query = {
        location: coords,
        radius: 50000,
        name,
        language: config.get().locale
    }

    const results = await placesRequest
        .query(query)
        .get()
        .json()
        .catch(error => {
            // Network error
            if (error.name === 'TypeError')
                throw new Error('APIRequest')
            // Other error
            throw new Error('APIResponse')
        })

    return results
}
