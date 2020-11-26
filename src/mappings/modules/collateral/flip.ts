import { dataSource } from '@graphprotocol/graph-ts'
import { bytes, integer, units } from '@protofire/subgraph-toolkit'

import { Kick, LogNote } from '../../../../generated/templates/Flip/Flipper'

import { CollateralAuction, CollateralType, getSystemState } from '../../../entities'

export function handleFile(event: LogNote): void {
  let ilk = dataSource.context().getString('collateral')
  let collateral = CollateralType.load(ilk)

  if (collateral != null) {
    let what = event.params.arg1.toString()
    let data = bytes.toUnsignedInt(event.params.arg2)

    if (what == 'beg') {
      collateral.minimumBidIncrease = units.fromWad(data)
    } else if (what == 'ttl') {
      collateral.bidDuration = data
    } else if (what == 'tau') {
      collateral.auctionDuration = data
    }

    collateral.save()
  }
}

export function handleKick(event: Kick): void {
  let ilk = dataSource.context().getString('collateral')
  let collateral = CollateralType.load(ilk)

  if (collateral != null) {
    // TODO: Save new auction data
    let bid = new CollateralAuction(event.params.id.toString())
    bid.collateral = collateral.id

    collateral.auctionCount = collateral.auctionCount.plus(integer.ONE)

    bid.save()
    collateral.save()

    // Update system state
    let state = getSystemState(event)
    state.collateralAuctionCount = state.collateralAuctionCount.plus(integer.ONE)
    state.save()
  }
}
