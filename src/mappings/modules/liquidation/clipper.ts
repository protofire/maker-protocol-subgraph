import { BigDecimal } from '@graphprotocol/graph-ts'
import { units } from '@protofire/subgraph-toolkit'
import {
  Kick as KickEvent,
  Take as TakeEvent,
  Yank as YankEvent,
  Redo as RedoEvent,
  File as FileBigIntEvent,
  File1 as FileAddressEvent,
} from '../../../../generated/Clipper/Clipper'
import { SaleAuction } from '../../../../generated/schema'
import { saleAuctions, system as systemModule } from '../../../entities'

export function handleFile1(event: FileBigIntEvent): void {
  let what = event.params.what.toString()
  let data = event.params.data

  let systemState = systemModule.getSystemState(event)

  if (what == 'buf') {
    systemState.saleAuctionStartingPriceFactor = units.fromRay(data)
  } else if (what == 'tail') {
    systemState.saleAuctionResetTime = data
  } else if (what == 'cusp') {
    systemState.saleAuctionDropPercentage = units.fromRay(data)
  } else if (what == 'chip') {
    systemState.saleAuctionDaiToRaisePercentage = units.fromWad(data)
  } else if (what == 'tip') {
    systemState.saleAuctionFlatFee = units.fromRad(data)
  }
  systemState.save()
}

export function handleFile2(event: FileAddressEvent): void {
  let what = event.params.what.toString()
  let data = event.params.data

  let systemState = systemModule.getSystemState(event)

  if (what == 'spotter') {
    systemState.saleAuctionSpotterContract = data
  } else if (what == 'dog') {
    systemState.saleAuctionDogContract = data
  } else if (what == 'vow') {
    systemState.saleAuctionVowContract = data
  } else if (what == 'calc') {
    systemState.saleAuctionCalcContract = data
  }

  systemState.save()
}

export function handleKick(event: KickEvent): void {
  let id = event.params.id.toString()
  let tab = units.fromRad(event.params.tab)
  let lot = units.fromWad(event.params.lot)
  let usr = event.params.usr.toHexString()
  let kpr = event.params.kpr.toHexString()
  let top = units.fromRay(event.params.top)

  let saleAuction = saleAuctions.loadOrCreateSaleAuction(id, event)
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

      // TODO: Not tracking parcial boughts.
      // price [ray]
      // owe: Amount DAI bought [rad]
      // timestamp
    }

    saleAuction.boughtAt = event.block.timestamp
    saleAuction.updatedAt = event.block.timestamp
    saleAuction.save()
  }
}
export function handleRedo(event: RedoEvent): void {
  let id = event.params.id.toString()
  let top = units.fromRay(event.params.top)

  let saleAuction = SaleAuction.load(id)
  if (saleAuction) {
    saleAuction.resetedAt = event.block.timestamp
    saleAuction.startingPrice = top
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
