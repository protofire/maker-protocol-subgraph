import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, describe } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flap/Flapper'
import { handleDeal } from '../../../../../src/mappings/modules/system-stabilizer/flap'
import { tests } from '../../../../../src/mappings/modules/tests'
import { auctions, system as systemModule } from '../../../../../src/entities'

function createEvent(id: BigInt): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0xc959c42b'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(id).reverse())
  let arg2 = tests.helpers.params.getBytes('arg2', radBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2]))

  return event
}

describe('Flapper#handleDeal', () => {
  test('Updates Auction.active and Auction.deletedAt ', () => {
    let id = BigInt.fromString('50')
    let auctionId = id.toString()

    let event = createEvent(id)

    let auction = auctions.loadOrCreateSurplusAuction(auctionId, event) // load the Auction with the quantity value
    auction.endTimeAt = event.block.timestamp
    auction.highestBidder = event.transaction.from
    auction.quantity = BigInt.fromString('100')
    auction.updatedAt = BigInt.fromI32(0)
    auction.save()

    handleDeal(event)

    assert.fieldEquals('SurplusAuction', auctionId, 'deletedAt', event.block.timestamp.toString())
    assert.fieldEquals('SurplusAuction', auctionId, 'active', 'false')

    clearStore()
  })
})
