import { units } from '@protofire/subgraph-toolkit'
import { Kick as KickEvent, Yank as YankEvent } from '../../../../generated/Clipper/Clipper'
import { SaleAuction } from '../../../../generated/schema'
import { SaleAuctions } from '../../../entities'

export function handleKick(event: KickEvent): void {
  let idStr = event.params.id.toString()
  let tab = units.fromRad(event.params.tab)
  let lot = units.fromWad(event.params.lot)
  let usr = event.params.usr.toHexString()
  let kpr = event.params.kpr.toHexString()
  let top = units.fromRay(event.params.top)

  let saleAuction = SaleAuctions.loadOrCreateSaleAuction(idStr, event)
  saleAuction.amountDaiToRaise = tab
  saleAuction.amountCollateralToSell = lot
  saleAuction.userExcessCollateral = usr
  saleAuction.userIncentives = kpr
  saleAuction.startingPrice = top
  saleAuction.isActive = true

  saleAuction.save()

  // FYI not saving the COIN value.
}

export function handleYank(event: YankEvent): void {
  let id = event.params.id.toString()

  let saleAuction = SaleAuction.load(id)

  if (saleAuction) {
    saleAuction.isActive = false
    saleAuction.deletedAt = event.block.timestamp
    saleAuction.save()
  }
}
