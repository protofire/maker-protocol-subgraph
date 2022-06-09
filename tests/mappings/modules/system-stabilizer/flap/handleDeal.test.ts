import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, describe } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flap/Flapper'
import { handleDeal } from '../../../../../src/mappings/modules/system-stabilizer/flap'
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

describe('Flapper#handleDeal', () => {
  test('Updates Auction.active and Auction.deleteAt ', () => {
    let id = BigInt.fromString('50')
    let auctionId = id.toString() + '-0'

    let event = createEvent(id)

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
})