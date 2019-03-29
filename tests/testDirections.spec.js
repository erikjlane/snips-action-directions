require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const { configFactory } = require('../src/factories')
const { getMessageKey } = require('./helpers/tools')
const {
    createLocationFromSlot,
    createLocationToSlot,
    createTravelModeSlot
} = require('./utils')

it('should ask to configure the current location of the device', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: '',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentAddress')
})

it('should ask to properly configure the current location of the device', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'random_value',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.badCurrentAddress')
})

it('should ask to properly configure the home location', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '',
        home_city: '',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.noHomeAddress')
})

it('should ask to properly configure the work location', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: '',
        work_city: '',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.noWorkAddress')
})

it('should ask the missing destination and pass', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const whichDestinationMsg = await session.continue({
        intentName: 'snips-assistant:ElicitDestination',
        input: 'I want to go to Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichDestinationMsg.text)).toBe('directions.dialog.noDestinationAddress')

    const endMsg = (await session.end()).text
    expect(endMsg.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.includes('directions.directions.transit.metro')).toBeTruthy()

})

it('should ask the missing destination twice and pass', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const whichDestinationMsg1 = (await session.continue({
        intentName: 'snips-assistant:ElicitDestination',
        input: 'I want to go to'
    })).text
    expect(getMessageKey(whichDestinationMsg1)).toBe('directions.dialog.noDestinationAddress')

    const whichDestinationMsg2 = (await session.continue({
        intentName: 'snips-assistant:ElicitDestination',
        input: 'I want to go to Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })).text
    expect(getMessageKey(whichDestinationMsg2)).toBe('directions.dialog.noDestinationAddress')

    const endMsg = (await session.end()).text
    expect(endMsg.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.includes('directions.directions.transit.metro')).toBeTruthy()
})

it('should ask the missing destination twice and fail', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to'
    })

    const whichDestinationMsg1 = (await session.continue({
        intentName: 'snips-assistant:ElicitDestination',
        input: 'I want to go'
    })).text
    expect(getMessageKey(whichDestinationMsg1)).toBe('directions.dialog.noDestinationAddress')
    
    const whichDestinationMsg2 = (await session.continue({
        intentName: 'snips-assistant:ElicitDestination',
        input: 'I want to go'
    })).text
    expect(getMessageKey(whichDestinationMsg2)).toBe('directions.dialog.noDestinationAddress')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.slotsNotRecognized')
})

it('should query the directions to go to Buckingham Palace (default: home & transit)', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'home',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go to Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace'),
        ]
    })

    const endMsg = (await session.end()).text
    expect(endMsg.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.includes('directions.directions.transit.metro')).toBeTruthy()
})

//TODO: the user asked for a trip by bus, but another transit mode is returned by Google (metro)
it('should query the directions to go from work to Buckingham Palace by bus', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go from work to Buckingham Palace by bus',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('bus')
        ]
    })

    const endMsg = (await session.end()).text
    expect(endMsg.includes('noTripWithTravelMode')).toBeTruthy()
    expect(endMsg.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.includes('directions.directions.transit.metro')).toBeTruthy()
})

it('should suggest another travel mode instead of car', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go from work to Buckingham Palace by car',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('car')
        ]
    })

    const endMsg = (await session.end()).text
    expect(endMsg.includes('noTripWithTravelMode')).toBeTruthy()
    expect(endMsg.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
    expect(endMsg.includes('directions.directions.transit.walkToMetro')).toBeTruthy()
})

it('should laugh of you', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'uk',
        current_location: 'work',
        home_address: '21 Onslow Gardens',
        home_city: 'London',
        work_address: 'Hammond Court, 10 Hotspur St',
        work_city: 'London',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetDirections',
        input: 'Give me directions to go from work to work by foot',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('work'),
            createTravelModeSlot('walking')
        ]
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.dialog.sameLocations')
})