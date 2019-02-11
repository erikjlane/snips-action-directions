module.exports = {
    createLocationFromSlot(address) {
        return {
            slotName: 'location_from',
            entity: 'address',
            confidence: 1,
            rawValue: address,
            value: {
                kind: 'Custom',
                value: address
            }
        }
    },

    createLocationToSlot (address) {
        return {
            slotName: 'location_to',
            entity: 'address',
            confidence: 1,
            rawValue: address,
            value: {
                kind: 'Custom',
                value: address
            }
        }
    },

    createTravelModeSlot (travelMode) {
        return {
            slotName: 'travel_mode',
            entity: 'travel_mode',
            confidence: 1,
            rawValue: travelMode,
            value: {
                kind: 'Custom',
                value: travelMode
            }
        }
    }
}
