import { Bytes, Address } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, describe } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Spot/Spotter'
import { handleCage } from '../../../../../src/mappings/modules/liquidation/dog'
import { tests } from '../../../../../src/mappings/modules/tests'
import { Cage } from '../../../../../generated/Dog/Dog'

function createEvent(): Cage {
  return changetype<Cage>(tests.helpers.events.getNewEvent([]))
}

describe('Dog#handleCage', () => {
  test('creates a new LiveChangeLog event', () => {
    let event = createEvent()

    let address = Address.fromString('0xB16081F360e3847006dB660bae1c6d1b2e17eC2A')
    let addressString = address.toHexString()
    event.address = address

    let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0'

    handleCage(event)

    assert.fieldEquals('LiveChangeLog', id, 'contract', addressString)

    clearStore()
  })
})
