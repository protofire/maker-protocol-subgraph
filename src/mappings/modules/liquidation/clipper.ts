import { units } from '@protofire/subgraph-toolkit'
import { BigDecimal } from '@graphprotocol/graph-ts'
import { Kick as KickEvent, Take as TakeEvent } from '../../../../generated/Clipper/Clipper'
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

export function handleTake(event: TakeEvent): void {
  let idStr = event.params.id.toString()
  let tab = units.fromRad(event.params.tab)
  let lot = units.fromWad(event.params.lot)

  let saleAuction = SaleAuctions.loadOrCreateSaleAuction(idStr, event)

  if (lot == BigDecimal.fromString('0')) {
    saleAuction.isActive = false
  } else if (tab == BigDecimal.fromString('0')) {
    saleAuction.isActive = false
  } else {
    saleAuction.amountDaiToRaise = tab
    saleAuction.amountCollateralToSell = lot
    saleAuction.boughtAt = event.block.timestamp
  }

  saleAuction.save()
}
