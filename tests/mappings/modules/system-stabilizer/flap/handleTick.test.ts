import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as'
import { tests } from '../../../../../src/mappings/modules/tests'
import { LogNote } from '../../../../../generated/Flap/Flapper'
import { handleTick } from '../../../../../src/mappings/modules/system-stabilizer/flap'
import { mockDebt } from '../../../../helpers/mockedFunctions'
import { system as systemModule } from '../../../../../src/entities'

function createEvent(id: BigInt): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0xfc7b6aee'))
  let usr = tests.helpers.params.getBytes('usr', Bytes.fromUTF8(''))

  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(id).reverse())
  let arg1 = tests.helpers.params.getBytes('arg2', radBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, usr, arg1]))

  return event
}

test('Flapper#handleTick: Updates the end-time of an auction', () => {
  let id = BigInt.fromString('50')

  let event = createEvent(id)

  mockDebt()
  let system = systemModule.getSystemState(event)
  system.surplusAuctionBidDuration = BigInt.fromString('1000')
  system.save()
  handleTick(event)

  assert.fieldEquals('SurplusAuction', id.toString(), 'endTime', '1001')
  clearStore()
})
