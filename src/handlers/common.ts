import { message, logger } from 'snips-toolkit'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { NluSlot, slotType, IntentMessage } from 'hermes-javascript/types'
import { checkCurrentCoordinates, getCompleteAddress, getCurrentLocation, containsFlag } from './utils'

export type KnownSlots = {
    depth: number,
    location_from?: string,
    location_to?: string,
    departure_time?: Date,
    arrival_time?: Date,
    travel_mode?: string
}

export default async function(msg: IntentMessage, knownSlots: KnownSlots) {
    checkCurrentCoordinates()

    let locationFrom, locationTo, travelMode

    // Slot location_from
    if (!('location_from' in knownSlots)) {
        const locationFromSlot: NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'location_from', {
            onlyMostConfident: true
        })

        if (locationFromSlot) {
            if (locationFromSlot.confidenceScore >= SLOT_CONFIDENCE_THRESHOLD) {
                locationFrom = getCompleteAddress(locationFromSlot.value.value)
            }
        } else {
            locationFrom = getCurrentLocation()
        }
    } else {
        locationFrom = knownSlots.location_from
    }

    // Here, the previous slot location_from can be missing if the attached confidence is too slow

    // Slot location_to
    if (!('location_to' in knownSlots)) {
        const locationToSlot: NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'location_to', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (locationToSlot) {
            locationTo = getCompleteAddress(locationToSlot.value.value)
        }
    } else {
        locationTo = knownSlots.location_to
    }

    // Slot travel_mode
    if (!('travel_mode' in knownSlots)) {
        const travelModeSlot: NluSlot<slotType.custom> | null = message.getSlotsByName(msg, 'travel_mode', { 
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (travelModeSlot) {
            const travelModeValue = travelModeSlot.value.value
            if (containsFlag('subway', travelModeValue)) travelMode = 'transit'
            else if (containsFlag('bike', travelModeValue)) travelMode = 'bicycling'
            else if (containsFlag('car', travelModeValue)) travelMode = 'driving'
            else if (containsFlag('walk', travelModeValue)) travelMode = 'walking'
            else if (containsFlag('train', travelModeValue)) travelMode = 'train'
            else if (containsFlag('bus', travelModeValue)) travelMode = 'bus'
            else travelMode = 'transit'
        } else {
            travelMode = 'transit'
        }
    } else {
        travelMode = knownSlots.travel_mode
    }

    logger.info('\tlocation_from: ', locationFrom)
    logger.info('\tlocation_to: ', locationTo)
    logger.info('\ttravel_mode: ', travelMode)

    return { locationFrom, locationTo, travelMode }
}
