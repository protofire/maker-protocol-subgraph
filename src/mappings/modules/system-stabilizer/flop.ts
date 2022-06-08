import { bytes, units } from '@protofire/subgraph-toolkit'
import { Kick, LogNote } from '../../../../generated/Flop/Flopper'
import { system as systemModule } from '../../../entities'
import { Auctions } from '../../../entities/auction'

import { LiveChangeLog } from '../../../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = systemModule.getSystemState(event)

  if (what == 'beg') {
    system.debtAuctionMinimumBidIncrease = units.fromWad(data)
  } else if (what == 'pad') {
    system.debtAuctionLotSizeIncrease = units.fromWad(data)
  } else if (what == 'ttl') {
    system.debtAuctionBidDuration = data
  } else if (what == 'tau') {
    system.debtAuctionDuration = data
  }

  system.save()
}

// Change Liveness of Flopper Contract
export function handleCage(event: LogNote): void {
  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

// Restarts an auction
export function handleTick(event: LogNote): void {
  let ONE = units.WAD // 1E18 from https://github.com/protofire/subgraph-toolkit
  let id = bytes.toUnsignedInt(event.params.arg1)

  let auction = Auctions.loadOrCreateAuction(id.toString() + '-1', event)
  let system = systemModule.getSystemState(event)

  let lotSizeIncrease = system.debtAuctionLotSizeIncrease // pad (name in contract)
  let auctionBidDuration = system.debtAuctionBidDuration // ttl
  let quantity = auction.quantity //lot

  if (lotSizeIncrease && auctionBidDuration) {
    let mul = lotSizeIncrease.times(quantity.toBigDecimal())
    auction.quantity = units.toWad(mul.div(ONE)) // WAD
    auction.endTime = event.block.timestamp.plus(auctionBidDuration)

    auction.lastUpdate = event.block.timestamp
    auction.save()
  }
}

export function handleKick(event: Kick): void {
  let id = event.params.id
  let lot = event.params.lot
  let bid = event.params.bid
  let gal = event.params.gal

  let auction = Auctions.loadOrCreateAuction(id.toString() + '-1', event)
  auction.bidAmount = bid
  auction.quantity = lot
  auction.highestBidder = gal

  let system = systemModule.getSystemState(event)
  if (system.surplusAuctionBidDuration) {
    auction.endTime = event.block.timestamp.plus(system.surplusAuctionBidDuration!)
  }
  auction.save()
}

export function handleDent(event: LogNote): void {
  let id = bytes.toUnsignedInt(event.params.arg1)
  let auction = Auctions.loadOrCreateAuction(id.toString() + '-1', event)
  auction.highestBidder = event.transaction.from
  auction.quantity = BigInt.fromUnsignedBytes(event.params.arg2)

  let system = systemModule.getSystemState(event)
  if (system.debtAuctionBidDuration) {
    auction.endTime = event.block.timestamp.plus(system.debtAuctionBidDuration!)
  }
  auction.save()
}
