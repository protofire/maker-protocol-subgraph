import { bytes, units } from '@protofire/subgraph-toolkit'
import { Kick, LogNote } from '../../../../generated/Flap/Flapper'
import { auctions } from '../../../entities/auctions'
import { system as systemModule } from '../../../entities'
import { LiveChangeLog } from '../../../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = systemModule.getSystemState(event)

  if (what == 'beg') {
    system.surplusAuctionMinimumBidIncrease = units.fromWad(data)
  } else if (what == 'ttl') {
    system.surplusAuctionBidDuration = data
  } else if (what == 'tau') {
    system.surplusAuctionDuration = data
  }

  system.save()
}

// Change Liveness of Flapper Contract
export function handleCage(event: LogNote): void {
  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleKick(event: Kick): void {
  let id = event.params.id
  let lot = event.params.lot
  let bid = event.params.bid

  let auction = auctions.loadOrCreateSurplusAuction(id.toString(), event)
  auction.bidAmount = bid
  auction.quantity = lot
  // might be wrong since the smart contract refers to msg.sender
  auction.highestBidder = event.transaction.from

  let system = systemModule.getSystemState(event)
  if (system.surplusAuctionBidDuration) {
    auction.endTimeAt = event.block.timestamp.plus(system.surplusAuctionBidDuration!)
  }
  auction.active = true
  auction.save()
}

export function handleTick(event: LogNote): void {
  let id = bytes.toUnsignedInt(event.params.arg1)
  let auction = auctions.loadOrCreateSurplusAuction(id.toString(), event)

  let system = systemModule.getSystemState(event)
  if (system.surplusAuctionBidDuration) {
    auction.endTimeAt = event.block.timestamp.plus(system.surplusAuctionBidDuration!)
  }

  auction.updatedAt = event.block.timestamp

  auction.save()
}

//  claim a winning bid / settles a completed auction
export function handleDeal(event: LogNote): void {
  let id = bytes.toUnsignedInt(event.params.arg1)
  let auction = auctions.loadOrCreateSurplusAuction(id.toString(), event)

  //auction to inactive "delete"
  auction.deletedAt = event.block.timestamp
  auction.active = false

  auction.save()
}

export function handleTend(event: LogNote): void {
  let id = bytes.toUnsignedInt(event.params.arg1)
  let auction = auctions.loadOrCreateSurplusAuction(id.toString(), event)

  if (auction.highestBidder.toHexString() !== event.transaction.from.toHexString()) {
    auction.highestBidder = event.transaction.from
  }

  let system = systemModule.getSystemState(event)
  auction.bidAmount = BigInt.fromByteArray(event.params.arg2)
  if (system.surplusAuctionBidDuration) {
    auction.endTimeAt = event.block.timestamp.plus(system.surplusAuctionBidDuration!)
  }
  auction.save()
}

export function handleYank(event: LogNote): void {
  let id = bytes.toUnsignedInt(event.params.arg1)

  let auction = auctions.loadOrCreateSurplusAuction(id.toString(), event)
  auction.active = false
  auction.deletedAt = event.block.timestamp

  auction.save()
}
