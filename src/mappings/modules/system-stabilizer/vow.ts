import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote, Vow } from '../../../../generated/Vow/Vow'

import { system as systemModule } from '../../../entities'

import { LiveChangeLog, PopDebtQueueLog } from '../../../../generated/schema'

import { ethereum, Address } from '@graphprotocol/graph-ts'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = systemModule.getSystemState(event)

  if (what == 'wait') {
    system.debtAuctionDelay = data
  } else if (what == 'bump') {
    system.surplusAuctionLotSize = units.fromRad(data)
  } else if (what == 'sump') {
    system.debtAuctionBidSize = units.fromRad(data)
  } else if (what == 'dump') {
    system.debtAuctionInitialLotSize = units.fromWad(data)
  } else if (what == 'hump') {
    system.surplusAuctionBuffer = units.fromRad(data)
  }

  system.save()
}

// Change Liveness of Vow Contract
export function handleCage(event: LogNote): void {
  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleFlog(event: LogNote): void {
  let era = bytes.toUnsignedInt(event.params.arg1)
  let system = systemModule.getSystemState(event)
  let vowContract = Vow.bind(Address.fromString('0xa950524441892a31ebddf91d3ceefa04bf454466'));
  let amount = vowContract.sin(era)
  system.systemDebtInQueue = system.systemDebtInQueue.minus(units.fromRad(amount))
  
  system.save()

  let log = new PopDebtQueueLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-1')
  log.amount = units.fromRad(amount)
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}