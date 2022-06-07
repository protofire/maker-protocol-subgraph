import { Bytes, Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { units, bytes } from '@protofire/subgraph-toolkit'
import { test, clearStore, assert, log } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flop/Flopper'
import { handleDeal } from '../../../../../src/mappings/modules/system-stabilizer/flop'
import { tests } from '../../../../../src/mappings/modules/tests'
import { Auctions, system as systemModule } from '../../../../../src/entities'

function createEvent(id: BigInt): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0xc959c42b'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(id).reverse())
  let arg2 = tests.helpers.params.getBytes('arg2', radBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2]))

  return event
}

test('Flopper#handleDeal updates Auction.active and Auction.deleteAt ', () => {
  let Id = BigInt.fromString('50')
  let auctionId = Id.toString() + '-1'

  let event = createEvent(Id)

  let auction = Auctions.loadOrCreateAuction(auctionId, event) // load the Auction with the quantity value
  auction.endTime = event.block.timestamp
  auction.highestBidder = event.transaction.from
  auction.quantity = BigInt.fromString('100')
  auction.lastUpdate = BigInt.fromI32(0)
  auction.save()

  handleDeal(event)

  assert.fieldEquals('Auction', auctionId, 'deleteAt', event.block.timestamp.toString())
  assert.fieldEquals('Auction', auctionId, 'active', 'false')

  clearStore()
})
