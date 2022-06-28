import { Cage, File, File1, File2, File3 } from '../../../../generated/Dog/Dog'
import { LiveChangeLog } from '../../../../generated/schema'
import { collateralTypes, system as systemModule } from '../../../entities'
import { units } from '@protofire/subgraph-toolkit'

export function handleCage(event: Cage): void {
  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
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
    system.maxDaiCoverForAuction = units.fromRad(event.params.data)
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
    ilk.maxDaiCoverForAuction = units.fromRad(event.params.data)
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
