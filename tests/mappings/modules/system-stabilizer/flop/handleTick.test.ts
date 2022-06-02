import { Bytes, Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { units } from '@protofire/subgraph-toolkit'
import { test, clearStore, assert } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flop/Flopper'
import { handleTick } from '../../../../../src/mappings/modules/system-stabilizer/flop'
import { tests } from '../../../../../src/mappings/modules/tests'
import { Auctions, system as systemModule } from '../../../../../src/entities'

test('Flopper#handleTick updates Auction.quantity and Auction.endTime', () => {
  let bidId = BigInt.fromString('1')
  let auctionId = bidId.toString() + '-1'

  let ONE = units.WAD
  let auctionBidDuration = BigInt.fromI32(172800) // 2 days | ttl
  let lotSizeIncrease = BigDecimal.fromString('1500000000000000000') // 1.50E18 | pad

  let quantity = BigInt.fromString('10000000000000000000000000000000000000000000000000') // lot

  let signature = '0xfc7b6aee'
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString(signature))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(bidId.toString()))

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1]))

  let UPDATED_ADDRESS = '0x4d95a049d5b0b7d32058cd3f2163015747522e99'
  let address = Address.fromString(UPDATED_ADDRESS)
  event.address = address

  let auction = Auctions.loadOrCreateAuction(auctionId, event)
  auction.endTime = event.block.timestamp
  auction.quantity = quantity

  let system = systemModule.getSystemState(event) // load the vars in the system entity
  system.debtAuctionBidDuration = auctionBidDuration
  system.debtAuctionLotSizeIncrease = lotSizeIncrease
  system.save()

  handleTick(event)

  // Make the calcs that are inside the handleTick function
  let endTime = event.block.timestamp.plus(auctionBidDuration)
  let finalQuantity: BigInt = units.toRad(lotSizeIncrease.plus(quantity.toBigDecimal()).div(ONE))

  // Test
  assert.fieldEquals('Auction', auctionId, 'endTime', endTime.toString())
  assert.fieldEquals('Auction', auctionId, 'quantity', finalQuantity.toString())

  clearStore()
})
