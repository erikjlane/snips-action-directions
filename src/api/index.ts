import { http, config } from 'snips-toolkit'
import { BASE_URL_DIRECTIONS, BASE_URL_PLACES } from '../constants'
import wretch from 'wretch'
import { dedupe } from 'wretch-middlewares'
import { nearbySearch } from './nearbySearch'

export let directionsRequest = http(BASE_URL_DIRECTIONS)
export let placesRequest = http(BASE_URL_PLACES)

export function init() {
    directionsRequest = directionsRequest.query({
        key: config.get().apiKey
    }).middlewares([
        dedupe(),
        next => async (url, opts) => {
            let query = {
                ...opts.query,
                key: config.get().apiKey
            }

            // Origin
            if (opts.origin !== config.get().homeAddress && opts.origin !== config.get().workAddress) {
                const originPlaces = await nearbySearch(config.get().currentCoordinates, opts.origin)

                const originPlace = originPlaces.results[0]
                if (originPlaces.status !== 'ZERO_RESULTS' && originPlace) {
                    // Storing the name
                    opts.context.originName = originPlace.name
                    // Places returned some results, extract and pass the place_id to Directions
                    query = {
                        ...query,
                        origin: 'place_id:' + originPlace.place_id
                    }
                }
            }

            // Destination
            if (opts.destination !== config.get().homeAddress && opts.destination !== config.get().workAddress) {
                const destinationPlaces = await nearbySearch(config.get().currentCoordinates, opts.destination)

                const destinationPlace = destinationPlaces.results[0]
                if (destinationPlaces.status !== 'ZERO_RESULTS' && destinationPlace) {
                    // Storing the name
                    opts.context.destinationName = destinationPlace.name
                    // Places returned some results, extract and pass the place_id to Directions
                    query = {
                        ...query,
                        destination: 'place_id:' + destinationPlace.place_id
                    }
                }

                if (opts.context.originName || opts.context.destinationName) {
                    return wretch(BASE_URL_DIRECTIONS).query(query).get().res()
                }
            }

            return next(url, opts)
        }
    ])

    placesRequest = placesRequest.query({
        key: config.get().apiKey
    })
}

export * from './calculateRoute'
export * from './nearbySearch'
export * from './types'