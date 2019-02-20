const { i18nFactory, configFactory } = require('../factories')

function metersToFeet(distance) {
    return distance * 3.28084
}

module.exports = {    
    time: date => {
        const config = configFactory.get()

        if (config.locale === 'french') {
            // French
            return date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
        } else {
            // English
            const meridiem = (date.getHours() > 11) ? 'pm' : 'am'
            const hours = (meridiem === 'pm') ? date.getHours() - 12 : date.getHours()

            return hours + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ' ' + meridiem
        }
    },
    
    address: address => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
    
        if (address.includes(config.homeAddress) || config.homeAddress.includes(address)) {
            return i18n('directions.fromLocation.home')
        }
        if (address.includes(config.workAddress) || config.workAddress.includes(address)) {
            return i18n('directions.fromLocation.work')
        }
    
        return address.split(',')[0]
    },

    headsign: address => {
        const config = configFactory.get()

        if (config.locale === 'english') {
            address = address.replace(/(.*)( Av| AV| Av\.)(\/|$|-| )(.*)/g, '$1 Avenue$3$4')
            address = address.replace(/(.*)( St)(\/|$|-| )(.*)/g, '$1 Street$3$4')
        }

        return address
    },
    
    distance: distance => {
        const i18n = i18nFactory.get()
        const config = configFactory.get()
    
        if (config.unitSystem === 'imperial') {
            distance = metersToFeet(distance)
    
            if (distance > 5280) {
                distance = +(Math.round(distance / 5280 + 'e+1') + 'e-1')
                return i18n('units.distance.imperial.miles', { distance: distance })
            } else {
                distance = 100 * Math.floor(distance / 100)
                return i18n('units.distance.imperial.feet', { distance: distance })
            }
        } else {
            if (distance > 999) {
                distance /= 1000

                if (distance > 20) {
                    distance = Math.round(distance)
                } else {
                    distance = +(Math.round(distance + 'e+1') + 'e-1')
                }

                return i18n('units.distance.metric.kilometers', { distance: distance })
            } else {
                distance = 10 * Math.floor(distance / 10)
                return i18n('units.distance.metric.meters', { distance: distance })
            }
        }
    },

    duration: duration => {
        const i18n = i18nFactory.get()

        const minutes = Math.round(duration / 60)

        if (minutes > 59) {
            const str =
                i18n('units.duration.hours', { duration: Math.floor(minutes / 60) }) + ' ' +
                i18n('joins.andSomething', { something: i18n('units.duration.minutes', { duration: minutes % 60 }) })

            return str
        } else {
            return i18n('units.duration.minutes', { duration: minutes })
        }
    }
}