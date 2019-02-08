const { i18nFactory, configFactory } = require('../factories')

function metersToFeet(distance) {
    return distance * 3.28084
}

module.exports = {    
    hoursAndMinutes: date => {
        return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
    },
    
    address: address => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
    
        if (address.includes(config.homeAddress)) {
            return i18n('directions.fromLocation.home')
        }
        if (address.includes(config.workAddress)) {
            return i18n('directions.fromLocation.work')
        }
    
        return address.split(',')[0]
    },
    
    distance: distance => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
    
        if (config.unitSystem === 'imperial') {
            distance = metersToFeet(distance)
    
            if (distance > 5280) {
                distance = +(Math.round(distance / 5280 + "e+1") + "e-1")
                return i18n('units.imperial.miles', { distance: distance })
            } else {
                distance = 100 * Math.floor(distance / 100)
                return i18n('units.imperial.feet', { distance: distance })
            }
        } else {
            if (distance > 999) {
                distance = +(Math.round(distance / 1000 + "e+1") + "e-1")
                return i18n('units.metric.kilometers', { distance: distance })
            } else {
                distance = 10 * Math.floor(distance / 10)
                return i18n('units.metric.meters', { distance: distance })
            }
        }
    }
}