import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { decimal } from '@protofire/subgraph-toolkit'
import { test, clearStore, assert } from 'matchstick-as'
import { SystemState } from '../../../../../generated/schema'
import { LogNote } from '../../../../../generated/Vow/Vow'
import { handleKiss } from '../../../../../src/mappings/modules/system-stabilizer/vow'
import { tests } from '../../../../../src/mappings/modules/tests'

function createEvent(rad: string): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x1a0b287e'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(rad)).reverse())
  let arg2 = tests.helpers.params.getBytes('arg2', radBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2]))

  return event
}

test('Vow#handleKiss: Updates debtOnAuctionTotalAmount', () => {
  let rad = '100500000000000000000000000000000000000000000000'

  let systemState = new SystemState('current')
  systemState.debtOnAuctionTotalAmount = decimal.ZERO
  systemState.save()

  let event = createEvent(rad)

  handleKiss(event)

  assert.fieldEquals('SystemState', 'current', 'debtOnAuctionTotalAmount', '100.5')

  clearStore()
})
