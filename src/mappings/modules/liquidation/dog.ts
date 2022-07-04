import { Cage, Digs, File, File1, File2, File3, Bark, Dog } from '../../../../generated/Dog/Dog'
import { LiveChangeLog, Vault } from '../../../../generated/schema'
import { collateralTypes, system as systemModule, saleAuctions, collaterals } from '../../../entities'
import { units } from '@protofire/subgraph-toolkit'
import { Address, log } from '@graphprotocol/graph-ts'

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
  saleAuction.clipperContract = event.params.clip
  saleAuction.save()

  let dogContract = Dog.bind(Address.fromString('0x135954d155898D42C90D2a57824C690e0c7BEf1B'))
  let callResult = dogContract.try_Dirt()
  let callResult2 = dogContract.try_ilks(event.params.ilk)
  let ilkDirt = units.fromRad(callResult2.value.value3)

  if (callResult.reverted) {
    log.warning('handleBark: try_Dirt reverted', [])
  }
  let amount = units.fromRad(callResult.value)
  let system = systemModule.getSystemState(event)
  system.totalDaiAmountToCoverDebtAndFees = amount
  system.save()

  if (callResult2.reverted) {
    log.warning('handleBark: try_ilks reverted', [])
  }

  let collateralType = collateralTypes.loadOrCreateCollateralType(collateralTypeId)
  collateralType.daiAmountToCoverDebtAndFees = ilkDirt
  collateralType.save()
}
