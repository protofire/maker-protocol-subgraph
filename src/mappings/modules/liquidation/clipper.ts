import { BigDecimal, Address } from '@graphprotocol/graph-ts'
import { units } from '@protofire/subgraph-toolkit'
import { Kick, Redo, Clipper } from '../../../../generated/Clipper/Clipper'
import { SaleAuctions } from '../../../entities'

export function handleKick(event: Kick): void {
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

export function handleRedo(event: Redo): void {
  let idStr = event.params.id.toString()
  let top = units.fromRay(event.params.top)

  let saleAuction = SaleAuctions.loadOrCreateSaleAuction(idStr, event)
  saleAuction.resetedAt = event.block.timestamp
  saleAuction.startingPrice = top

  saleAuction.save()
}
