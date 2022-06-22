import { dataSource } from '@graphprotocol/graph-ts'
import { bytes, integer, units } from '@protofire/subgraph-toolkit'
import { CollateralAuction, CollateralType } from '../../../../generated/schema'

import { Kick } from '../../../../generated/Clipper/Clipper'

import { system as systemModule } from '../../../entities'

export function handleKick(event: Kick): void {
    /* 
    uint256 tab,  // Debt                   [rad]
    uint256 lot,  // Collateral             [wad]
    address usr,  // Address that will receive any leftover collateral
    address kpr   // Address that will receive incentives 
    */


/*   let ilk = dataSource.context().getString('collateral')
  let collateral = CollateralType.load(ilk)

  if (collateral != null) {
    let bid = new CollateralAuction(event.params.id.toString())
    bid.collateral = collateral.id

    collateral.auctionCount = collateral.auctionCount.plus(integer.ONE)

    bid.save()
    collateral.save()

    // Update system state
    let state = systemModule.getSystemState(event)
    state.collateralAuctionCount = state.collateralAuctionCount.plus(integer.ONE)
    state.save() */
  }
}
