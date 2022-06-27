import { Cage, Digs } from '../../../../generated/Dog/Dog'
import { LiveChangeLog } from '../../../../generated/schema'
import { system } from '../../../entities/System'
import { address, units } from '@protofire/subgraph-toolkit'

export function handleCage(event: Cage): void {
  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleDigs(event: Digs): void {
  let systemState = system.getSystemState(event)
  let amount = units.fromRad(event.params.rad)
  systemState.totalAuctionDebtAndFees = systemState.totalAuctionDebtAndFees.minus(amount)
  systemState.save()
}
