import { Bytes, BigInt, ethereum, Address } from '@graphprotocol/graph-ts'
import { describe, test, assert, clearStore, beforeAll, afterAll } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Pot/Pot'
import { handleDrip } from '../../../../../src/mappings/modules/rates/pot'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt, mockChi } from '../../../../helpers/mockedFunctions'

function createEvent(): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x58326b7a'))
  let usr = tests.helpers.params.getBytes('usr', Bytes.fromUTF8(''))

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, usr]))

  return event
}

describe('Pot#handleDrip', () => {
  test('Updates SystemState.rateAccumulator', () => {
    let event = createEvent()
    mockChi()
    mockDebt()

    handleDrip(event)

    assert.fieldEquals('SystemState', 'current', 'rateAccumulator', '10')

    clearStore()
  })
})
