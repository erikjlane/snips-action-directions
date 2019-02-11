require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const { createLocationFromSlot, createLocationToSlot, createTravelModeSlot } = require('./utils')

it('should query the navigation time to go from Glasgow to Bristol by bike', async () => {
    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:GetNavigationTime',
        input: 'How much time to go from Glasgow to Bristol by bike',
        slots: [
            createLocationFromSlot('Glasgow'),
            createLocationToSlot('Bristol'),
            createTravelModeSlot('bike')
        ]
    })
    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const { key, options } = JSON.parse((await session.end()).text)
    expect(key).toBe('directions.navigationTime.bicycling')
    expect(options.name).toBe('bulbasaur')
    expect(options.weight).toBe(69)
    expect(options.height).toBe(7)
})