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
  let tab = units.fromRad(event.params.tab)
  let lot = units.fromWad(event.params.lot)
  let usr = event.params.usr.toHexString()
  let kpr = event.params.kpr.toHexString()
  let top = units.fromRay(event.params.top)

  let saleAuction = SaleAuctions.loadOrCreateSaleAuction(idStr, event)
  saleAuction.resetedAt = event.block.timestamp

  /* uint256 feedPrice = getFeedPrice();
  top = rmul(feedPrice, buf); */
  let clipperContract = Clipper.bind(Address.fromString('0xc67963a226eddd77B91aD8c421630A1b0AdFF270'))

  clipperContract.

  let newTop = BigDecimal.fromString('0')
  saleAuction.startingPrice = newTop

  saleAuction.save()
}
