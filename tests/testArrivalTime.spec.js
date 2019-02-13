require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const { configFactory } = require('../src/factories')
const { getMessageKey, getMessageOptions } = require('./helpers/tools')
const {
    createLocationFromSlot,
    createLocationToSlot,
    createTravelModeSlot,
    createDepartureTimeSlot
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I will be leaving at ten pm, when will I arrive at Buckingham Palace?',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'What time should will I arrive'
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'What time should will I arrive'
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'What time should will I arrive'
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I have to be at at ten pm, when should I leave?',
        slots: [
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const whichDestinationMsg = await session.continue({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I want to go at Buckingham Palace',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })
    expect(getMessageKey(whichDestinationMsg.text)).toBe('directions.dialog.noDestinationAddress')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Westminster')
})

it('should ask the missing departure time and pass', async () => {
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I have to be at Buckingham Palace, when should I leave?',
        slots: [
            createLocationToSlot('Buckingham Palace')
        ]
    })

    const whichDepartureTimeMsg = await session.continue({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I want to go at Buckingham Palace',
        slots: [
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })
    expect(getMessageKey(whichDepartureTimeMsg.text)).toBe('directions.dialog.noDepartureTime')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Westminster')
})

it('should ask the missing destination & departure time and pass', async () => {
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I have to be at, when should I leave?'
    })

    const whichDestinationAndDepartureTimeMsg = await session.continue({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I want to go arrive at Buckingham Palace at ten pm',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })
    expect(getMessageKey(whichDestinationAndDepartureTimeMsg.text)).toBe('directions.dialog.noDestinationAddressAndDepartureTime')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Westminster')
})

it('should ask the missing destination and departure time twice and pass', async () => {
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I want to arrive at'
    })

    const whichDestinationAndDepartureTimeMsg1 = (await session.continue({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I want to arrive at'
    })).text
    expect(getMessageKey(whichDestinationAndDepartureTimeMsg1)).toBe('directions.dialog.noDestinationAddressAndDepartureTime')
    
    const whichDestinationAndDepartureTimeMsg2 = (await session.continue({
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I want to arrive at Buckingham Palace at ten pm',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })).text
    expect(getMessageKey(whichDestinationAndDepartureTimeMsg2)).toBe('directions.dialog.noDestinationAddressAndDepartureTime')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.transit')
    expect(getMessageKey(getMessageOptions(endMsg).location_from)).toBe('directions.fromLocation.home')
    expect(getMessageOptions(endMsg).location_to).toBe('Westminster')
})

it('should query the arrival time when going to Buckingham Palace (default: home & transit)', async () => {
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I will be leaving at ten pm, when will I arrive at Buckingham Palace?',
        slots: [
            createLocationToSlot('Buckingham Palace'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.transit')
})

it('should query the arrival time when going from work to Buckingham Palace if leaving at ten pm by foot', async () => {
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
        intentName: 'snips-assistant:GetArrivalTime',
        input: 'I will be leaving at ten pm, when will I arrive at Buckingham Palace if I am walking?',
        slots: [
            createLocationFromSlot('work'),
            createLocationToSlot('Buckingham Palace'),
            createTravelModeSlot('walk'),
            createDepartureTimeSlot('2019-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('directions.arrivalTime.walking')
})