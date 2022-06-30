import { units } from '@protofire/subgraph-toolkit'
import { BigDecimal } from '@graphprotocol/graph-ts'
import { Kick as KickEvent, Take as TakeEvent, Yank as YankEvent } from '../../../../generated/Clipper/Clipper'
import { SaleAuction } from '../../../../generated/schema'
import { SaleAuctions } from '../../../entities'

export function handleKick(event: KickEvent): void {
  let id = event.params.id.toString()
  let tab = units.fromRad(event.params.tab)
  let lot = units.fromWad(event.params.lot)
  let usr = event.params.usr.toHexString()
  let kpr = event.params.kpr.toHexString()
  let top = units.fromRay(event.params.top)

  let saleAuction = SaleAuctions.loadOrCreateSaleAuction(id, event)
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
  let id = event.params.id.toString()
  let tab = units.fromRad(event.params.tab)
  let lot = units.fromWad(event.params.lot)

  let saleAuction = SaleAuction.load(id)

  if (saleAuction) {
    if (lot == BigDecimal.fromString('0')) {
      saleAuction.isActive = false
    } else if (tab == BigDecimal.fromString('0')) {
      saleAuction.isActive = false
    } else {
      saleAuction.amountDaiToRaise = tab
      saleAuction.amountCollateralToSell = lot

      // TODO: Not incluining in the scheme parcial boughts.
      // price [ray]
      // owe: Amount DAI bought [rad]
      // timestamp
    }

    saleAuction.boughtAt = event.block.timestamp
    saleAuction.updatedAt = event.block.timestamp
    saleAuction.save()
  }
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
