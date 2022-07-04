import { Bytes, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { units } from '@protofire/subgraph-toolkit'
import { test, clearStore, assert, log } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flop/Flopper'
import { handleTick } from '../../../../../src/mappings/modules/system-stabilizer/flop'
import { mockDebt } from '../../../../helpers/mockedFunctions'
import { tests } from '../../../../../src/mappings/modules/tests'
import { auctions, system as systemModule } from '../../../../../src/entities'

function createEvent(id: BigInt): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0xfc7b6aee'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(id).reverse())
  let arg2 = tests.helpers.params.getBytes('arg2', radBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2]))

  return event
}

test('Flopper#handleTick updates Auction.quantity, Auction.endTime and Auction.lasUpdate', () => {
  let bidId = BigInt.fromString('1')
  let auctionId = bidId.toString()

  let ONE = units.WAD
  let auctionBidDuration = BigInt.fromI32(172800) // 2 days | ttl
  let lotSizeIncrease = BigDecimal.fromString('1.5') // 1.50E18 | pad

  let quantity = BigInt.fromString('10') // lot

  let event = createEvent(bidId)

  let auction = auctions.loadOrCreateDebtAuction(auctionId, event) // load the Auction with the quantity value
  auction.endTime = event.block.timestamp
  auction.quantity = quantity
  auction.lastUpdate = BigInt.fromI32(0)
  auction.save()

  mockDebt()

  let system = systemModule.getSystemState(event) // load the vars from the system entity
  system.debtAuctionBidDuration = auctionBidDuration
  system.debtAuctionLotSizeIncrease = lotSizeIncrease
  system.save()

  handleTick(event)

  // Make the calcs that are inside the handleTick function
  let endTime = event.block.timestamp.plus(auctionBidDuration)

  // Test
  assert.fieldEquals('DebtAuction', auctionId, 'endTime', endTime.toString()) //'172801'
  assert.fieldEquals('DebtAuction', auctionId, 'quantity', '15')
  assert.fieldEquals('DebtAuction', auctionId, 'lastUpdate', event.block.timestamp.toString())

  clearStore()
})
