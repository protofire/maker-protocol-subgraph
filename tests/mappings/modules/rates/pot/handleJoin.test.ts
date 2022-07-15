import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { describe, test, assert, clearStore, beforeAll, afterAll } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Pot/Pot'
import { handleJoin } from '../../../../../src/mappings/modules/rates/pot'
import { tests } from '../../../../../src/mappings/modules/tests'

var defaultAmount: string

function createEvent(amount: string): LogNote {
  let sig = '0x7f8661a1'
  let wad = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(amount)).reverse())
  return changetype<LogNote>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getBytes('sig', Bytes.fromHexString(sig)),
      tests.helpers.params.getBytes('usr', Bytes.fromUTF8('')),
      tests.helpers.params.getBytes('arg1', wad),
    ]),
  )
}

describe('Pot#handleJoin', () => {
  beforeAll(() => {
    defaultAmount = '100500000000000000000' // 100.5
  })

  test('Adds the amount to the user#savings when its zero and updates the system#totalSavingsInPot', () => {
    let event = createEvent(defaultAmount)
    handleJoin(event)

    assert.fieldEquals('User', event.transaction.from.toHexString(), 'savings', '100.5')
    assert.fieldEquals('SystemState', 'current', 'totalSavingsInPot', '100.5')
  })

  test('Adds the amount to the user#savings with balance in it and updates the system#totalSavingsInPot', () => {
    let event = createEvent(defaultAmount)
    handleJoin(event)

    assert.fieldEquals('User', event.transaction.from.toHexString(), 'savings', '201')
    assert.fieldEquals('SystemState', 'current', 'totalSavingsInPot', '201')
  })

  afterAll(() => {
    clearStore()
  })
})
