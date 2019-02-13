require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const { configFactory } = require('../src/factories')
const { getMessageKey, getMessageOptions } = require('./helpers/tools')
const {
    createLocationFromSlot,
    createLocationToSlot,
    createTravelModeSlot,
    createArrivalTimeSlot
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at Buckingham Palace at ten pm, when should I leave?',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'When should I leave'
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'What time should I leave'
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'What time should I leave'
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at at ten pm, when should I leave?',
        slots: [
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const whichDestinationMsg = await session.continue({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I want to go at Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichDestinationMsg.text)).toBe('directions.dialog.noDestinationAddress')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Westminster')
})

it('should ask the missing arrival time and pass', async () => {
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at Buckingham Palace, when should I leave?',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })

    const whichArrivalTimeMsg = await session.continue({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I want to go at Buckingham Palace',
        slots: [
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })
    expect(getMessageKey(whichArrivalTimeMsg.text)).toBe('directions.dialog.noArrivalTime')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Westminster')
})

it('should ask the missing destination & arrival time and pass', async () => {
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at, when should I leave?'
    })

    const whichDestinationAndArrivalTimeMsg = await session.continue({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I want to go arrive at Buckingham Palace at ten pm',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })
    expect(getMessageKey(whichDestinationAndArrivalTimeMsg.text)).toBe('directions.dialog.noDestinationAddressAndArrivalTime')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Westminster')
})

it('should ask the missing destination and arrival time twice and pass', async () => {
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I want to arrive at'
    })

    const whichDestinationAndArrivalTimeMsg1 = (await session.continue({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I want to arrive at'
    })).text
    expect(getMessageKey(whichDestinationAndArrivalTimeMsg1)).toBe('directions.dialog.noDestinationAddressAndArrivalTime')
    
    const whichDestinationAndArrivalTimeMsg2 = (await session.continue({
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I want to arrive at Buckingham Palace at ten pm',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })).text
    expect(getMessageKey(whichDestinationAndArrivalTimeMsg2)).toBe('directions.dialog.noDestinationAddressAndArrivalTime')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Westminster')
})

it('should query the departure time to be at Buckingham Palace at ten pm (default: home & transit)', async () => {
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at Buckingham Palace at ten pm, when should I leave?',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.transit')
})

it('should query the departure time to be at ten pm at Buckingham Palace if leaving from work by foot', async () => {
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
        intentName: 'snips-assistant:GetDepartureTime',
        input: 'I have to be at Buckingham Palace at ten pm, when should I leave from work by foot?',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('walk'),
            createArrivalTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.departureTime.walking')
})