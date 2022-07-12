import { BigDecimal } from '@graphprotocol/graph-ts'
import { bytes, units } from '@protofire/subgraph-toolkit'
import { VowFlapLog, VowFlopLog } from '../../../../generated/schema'
import { LogNote, Vow } from '../../../../generated/Vow/Vow'
import { system as systemModule } from '../../../entities'
import { Address } from '@graphprotocol/graph-ts'
import { LiveChangeLog, PushDebtQueueLog, PopDebtQueueLog } from '../../../../generated/schema'

export function handleFile(event: LogNote): void {
  let sig = event.params.sig.toHexString()
  let what = event.params.arg1.toString()

  let system = systemModule.getSystemState(event)

  if (sig == '0x29ae8114') {
    let data = bytes.toUnsignedInt(event.params.arg2)
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
  } else if (sig == '0xd4e8be83') {
    // TODO: Register the address and start collecting events from these contracts

    if (what == 'flapper') {
      let data = bytes.toAddress(event.params.arg2)
      system.vowFlapperContract = data
    } else if (what == 'flopper') {
      let data = bytes.toAddress(event.params.arg2)
      system.vowFlopperContract = data
    }
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
  let vowContract = Vow.bind(Address.fromString('0xa950524441892a31ebddf91d3ceefa04bf454466'))
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

export function handleFess(event: LogNote): void {
  let tab = bytes.toUnsignedInt(event.params.arg1)
  let system = systemModule.getSystemState(event)
  system.systemDebtInQueue = system.systemDebtInQueue.plus(units.fromRad(tab))

  system.save()

  let log = new PushDebtQueueLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-1')
  log.amount = units.fromRad(tab)
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleFlap(event: LogNote): void {
  let system = systemModule.getSystemState(event)
  let bump = system.surplusAuctionLotSize

  if (bump) {
    let log = new VowFlapLog(event.transaction.hash.toHexString())
    log.block = event.block.number
    log.transaction = event.transaction.hash
    log.timestamp = event.block.timestamp
    log.surplusAuctionLotSize = bump
    log.save()
  }
}

export function handleFlop(event: LogNote): void {
  let system = systemModule.getSystemState(event)
  let dump = system.debtAuctionInitialLotSize
  let sump = system.debtAuctionBidSize
  let ash = system.debtOnAuctionTotalAmount
  if (!ash) {
    ash = BigDecimal.zero()
  }

  if (dump && sump) {
    system.debtOnAuctionTotalAmount = ash.plus(sump)
    system.save()

    let log = new VowFlopLog(event.transaction.hash.toHexString())
    log.block = event.block.number
    log.transaction = event.transaction.hash
    log.timestamp = event.block.timestamp
    log.debtAuctionLotSize = dump
    log.debtAuctionBidSize = sump
    log.save()
  }
}

export function handleKiss(event: LogNote): void {
  let rad = units.fromRad(bytes.toUnsignedInt(event.params.arg1))

  let systemState = systemModule.getSystemState(event)
  let debtOnAuctionTotalAmount = systemState.debtOnAuctionTotalAmount

  if (debtOnAuctionTotalAmount) {
    systemState.debtOnAuctionTotalAmount = debtOnAuctionTotalAmount.plus(rad)
    systemState.save()
  }
}
