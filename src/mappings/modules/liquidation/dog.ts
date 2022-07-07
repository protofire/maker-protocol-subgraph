import { Cage, Digs, File, File1, File2, File3, Bark } from '../../../../generated/Dog/Dog'
import { LiveChangeLog } from '../../../../generated/schema'
import { collateralTypes, system as systemModule, saleAuctions } from '../../../entities'
import { units } from '@protofire/subgraph-toolkit'

export function handleCage(event: Cage): void {
  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleDigs(event: Digs): void {
  let systemState = systemModule.getSystemState(event)
  let amount = units.fromRad(event.params.rad)
  systemState.totalDaiAmountToCoverDebtAndFees = systemState.totalDaiAmountToCoverDebtAndFees.minus(amount)
  systemState.save()

  let collateralType = collateralTypes.loadOrCreateCollateralType(event.params.ilk.toString())
  collateralType.daiAmountToCoverDebtAndFees = collateralType.daiAmountToCoverDebtAndFees.minus(amount)
  collateralType.save()
}

export function handleFileVow(event: File1): void {
  let what = event.params.what.toString()

  if (what == 'vow') {
    let system = systemModule.getSystemState(event)
    system.dogVowContract = event.params.data
    system.save()
  }
}

export function handleFileHole(event: File): void {
  let what = event.params.what.toString()

  if (what == 'Hole') {
    let system = systemModule.getSystemState(event)
    system.maxDaiToCoverAuction = units.fromRad(event.params.data)
    system.save()
  }
}

export function handleFileChop(event: File2): void {
  let what = event.params.what.toString()
  let ilk = collateralTypes.loadOrCreateCollateralType(event.params.ilk.toString())

  if (what == 'chop') {
    ilk.liquidationPenalty = units.fromWad(event.params.data)
    ilk.save()
  } else if (what == 'hole') {
    ilk.maxDaiToCoverAuction = units.fromRad(event.params.data)
    ilk.save()
  }
}

export function handleFileClip(event: File3): void {
  let what = event.params.what.toString()
  let ilk = collateralTypes.loadOrCreateCollateralType(event.params.ilk.toString())

  if (what == 'clip') {
    ilk.liquidatorAddress = event.params.clip
    ilk.save()
  }
}

export function handleBark(event: Bark): void {
  let idStr = event.params.id.toString()
  let vaultId = event.params.urn.toHexString() + '-' + event.params.ilk.toString()
  let collateralTypeId = event.params.ilk.toString()
  let saleAuction = saleAuctions.loadOrCreateSaleAuction(idStr, event)
  saleAuction.vault = vaultId
  saleAuction.collateralType = collateralTypeId
  saleAuction.save()

  let due = units.fromWad(event.params.due)

  let collateralType = collateralTypes.loadOrCreateCollateralType(collateralTypeId)
  let liquidationPenalty = collateralType.liquidationPenalty
  let tab = liquidationPenalty.times(due)
  collateralType.daiAmountToCoverDebtAndFees = collateralType.daiAmountToCoverDebtAndFees.plus(tab)
  collateralType.save()

  let system = systemModule.getSystemState(event)
  system.totalDaiAmountToCoverDebtAndFees = system.totalDaiAmountToCoverDebtAndFees.plus(tab)
  system.save()
}
