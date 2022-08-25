import { BigInt } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as'
import { tests } from '../../../../../src/mappings/modules/tests'
import { system as systemModule } from '../../../../../src/entities'
import { Kick } from '../../../../../generated/Flap/Flapper'
import { handleKick } from '../../../../../src/mappings/modules/system-stabilizer/flap'

test('Flapper#handleKick: Creates the entity Auction.', () => {
  let id = BigInt.fromString('50')
  let lot = BigInt.fromString('10000000000000000000000000000000000000000000000000')
  let bid = BigInt.fromString('10')

  let auctionId = id
    .toString()
    .concat('-')
    .concat('surplus')

  let event = changetype<Kick>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getBigInt('id', id),
      tests.helpers.params.getBigInt('lot', lot),
      tests.helpers.params.getBigInt('bid', bid),
    ]),
  )
  event.block.timestamp = BigInt.fromString('1500')

  let system = systemModule.getSystemState(event)
  system.surplusAuctionBidDuration = BigInt.fromString('1000')
  system.save()
  handleKick(event)

  assert.fieldEquals('SurplusAuction', auctionId.toString(), 'quantity', lot.toString())
  assert.fieldEquals('SurplusAuction', auctionId.toString(), 'bidAmount', bid.toString())
  assert.fieldEquals('SurplusAuction', auctionId.toString(), 'highestBidder', event.transaction.from.toHexString())
  assert.fieldEquals('SurplusAuction', auctionId.toString(), 'endTimeAt', '2500')
  clearStore()
})
