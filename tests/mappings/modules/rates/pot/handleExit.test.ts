import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { describe, test, assert, clearStore, beforeAll } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Pot/Pot'
import { handleExit } from '../../../../../src/mappings/modules/rates/pot'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'

describe('Pot#handleExit', () => {
  beforeAll(() => {
    mockDebt()
  })

  test('Substracts the amount of the user#savings', () => {
    let sig = '0x7f8661a1'
    let wad = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString('100500000000000000000')).reverse())
    let event = changetype<LogNote>(
      tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes('sig', Bytes.fromHexString(sig)),
        tests.helpers.params.getBytes('usr', Bytes.fromUTF8('')),
        tests.helpers.params.getBytes('arg1', wad),
      ]),
    )

    handleExit(event)

    assert.fieldEquals('User', event.transaction.from.toHexString(), 'savings', '-100.5')
    assert.fieldEquals('SystemState', 'current', 'totalSavingsInPot', '-100.5')
    clearStore()
  })
})
