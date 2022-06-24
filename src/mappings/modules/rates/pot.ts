import { BigDecimal, Bytes } from '@graphprotocol/graph-ts'
import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Pot/Pot'

import { LiveChangeLog } from '../../../../generated/schema'
import { system as systemModule, users } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()

  let signature = event.params.sig.toHexString()

  if (signature == '0x29ae8114') {
    if (what == 'dsr') {
      let system = systemModule.getSystemState(event)
      let data = bytes.toUnsignedInt(event.params.arg2)

      system.savingsRate = units.fromRay(data) // Dai Savings Rate
      system.save()
    }
  } else if (signature == '0xd4e8be83') {
    if (what == 'vow') {
      let system = systemModule.getSystemState(event)
      let data = bytes.toAddress(event.params.arg2)
      system.potVowContract = data
      system.save()
    }
  }
}

export function handleCage(event: LogNote): void {
  let system = systemModule.getSystemState(event)
  system.savingsRate = BigDecimal.fromString('1') // Dai Savings Rate

  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  system.save()
  log.save()
}

export function handleJoin(event: LogNote): void {
  let wad = units.fromWad(bytes.toSignedInt(Bytes.fromUint8Array(event.params.arg1)))

  let user = users.getOrCreateUser(event.transaction.from)
  user.savings = user.savings.plus(wad)
  user.save()

  let system = systemModule.getSystemState(event)
  system.totalSavingsInPot = system.totalSavingsInPot.plus(wad)
  system.save()
}

export function handleExit(event: LogNote): void {
  let wad = units.fromWad(bytes.toSignedInt(Bytes.fromUint8Array(event.params.arg1)))

  let user = users.getOrCreateUser(event.transaction.from)
  user.savings = user.savings.minus(wad)
  user.save()

  let system = systemModule.getSystemState(event)
  system.totalSavingsInPot = system.totalSavingsInPot.minus(wad)
  system.save()
}
