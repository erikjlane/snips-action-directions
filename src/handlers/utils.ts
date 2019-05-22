import { config } from 'snips-toolkit'
import { WORK_SYNONYMS, HOME_SYNONYMS } from '../constants'

export const getCurrentLocation = function() {
    if (config.get().currentLocation) {
        switch (config.get().currentLocation) {
            case 'work':
                return getWorkLocation()
            case 'home':
                return getHomeLocation()
            default:
                throw new Error('badCurrentAddress')
        }
    } else {
        throw new Error('noCurrentAddress')
    }
}

export const getWorkLocation = function() {
    if (!config.get().workAddress || !config.get().workCity) {
        throw new Error('noWorkAddress')
    }

    return config.get().workAddress + ' ' + config.get().workCity
}

export const getHomeLocation = function() {
    if (!config.get().homeAddress || !config.get().homeCity) {
        throw new Error('noHomeAddress')
    }

    return config.get().homeAddress + ' ' + config.get().homeCity
}

export const getCompleteAddress = function(location) {
    const workSynonyms = WORK_SYNONYMS[config.get().locale]
    if (workSynonyms && workSynonyms.includes(location)) {
        return getWorkLocation()
    }

    const homeSynonyms = HOME_SYNONYMS[config.get().locale]
    if (homeSynonyms && homeSynonyms.includes(location)) {
        return getHomeLocation()
    }

    // Increasing precision if current city in provided
    /*
    if (config.currentLocation) {
        switch (config.currentLocation) {
            case 'work':
                if (!location.includes(config.workCity)) {
                    location += ' ' + config.workCity
                }
                break
            case 'home':
                if (!location.includes(config.homeCity)) {
                    location += ' ' + config.homeCity
                }
                break
            default:
                break
        }
    }
    */

    return location
}

export const checkCurrentCoordinates = function() {
    if (!config.get().currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}