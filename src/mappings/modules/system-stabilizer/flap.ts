import { bytes, units } from '@protofire/subgraph-toolkit'
import { Kick, LogNote } from '../../../../generated/Flap/Flapper'
import { Auctions } from "../../../entities/auction"
import { system as systemModule } from '../../../entities'

import { LiveChangeLog } from '../../../../generated/schema'

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

  let auction = Auctions.loadOrCreateAuction(id.toString()+"-0", event)
  auction.bidAmount = bid
  auction.quantity = lot
  // might be wrong since the smart contract refers to msg.sender
  auction.highestBidder = event.transaction.from

  let system = systemModule.getSystemState(event)
  if (system.surplusAuctionBidDuration){
    auction.endTime = event.block.timestamp.plus(system.surplusAuctionBidDuration!)
  }
  auction.save()
}

export function handleTick(event: LogNote): void{
  let id = bytes.toUnsignedInt(event.params.arg1)
  let auction = Auctions.loadOrCreateAuction(id.toString()+"-0", event)

  let system = systemModule.getSystemState(event)
  if (system.surplusAuctionBidDuration){
    auction.endTime = event.block.timestamp.plus(system.surplusAuctionBidDuration!)
  }

  auction.lastUpdate = event.block.timestamp
  
  auction.save()
}