import { bytes, units } from '@protofire/subgraph-toolkit'
import { Kick, LogNote } from '../../../../generated/Flop/Flopper'
import { system as systemModule } from '../../../entities'
import { Auctions } from '../../../entities/auction'

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

export function handleKick(event: Kick): void{
  let id = event.params.id
  let lot = event.params.lot
  let bid = event.params.bid
  let gal = event.params.gal
  
  let auction = Auctions.loadOrCreateAuction(id.toString()+"-1", event)
  auction.bidAmount = bid
  auction.quantity = lot
  auction.highestBidder = gal

  let system = systemModule.getSystemState(event)
  if (system.surplusAuctionBidDuration){
    auction.endTime = event.block.timestamp.plus(system.surplusAuctionBidDuration!)
  }
  auction.save()
}