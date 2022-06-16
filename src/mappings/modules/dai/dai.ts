import { BigInt, BigDecimal, log } from '@graphprotocol/graph-ts'
import { Dai, Approval, Transfer } from '../../../../generated/Dai/Dai'
import { DaiTransfers } from '../../../entities/daiTransfer'
import { address, units } from '@protofire/subgraph-toolkit'
import { system } from '../../../entities/System'
import { DaiApprovals } from '../../../entities/daiApproval'
import { users } from '../../../entities'

export function handleTransfer(event: Transfer): void {
  let value = units.fromWad(event.params.wad)
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let transfer = DaiTransfers.loadOrCreateDaiTransfer(id, event)

  if (address.isZeroAddress(event.params.src)) {
    // MINT
    transfer.from = event.params.src.toHex()
    transfer.to = event.params.dst.toHex()
    transfer.value = value
    transfer.save()

    let systemstate = system.getSystemState(event)
    systemstate.daiTotalSupply = systemstate.daiTotalSupply.plus(value)
    systemstate.save()

    users.plusBalanceERC20Dai(event.params.dst, value)
  } else if (address.isZeroAddress(event.params.dst)) {
    // BURN
    transfer.from = event.params.src.toHex()
    transfer.to = event.params.dst.toHex()
    transfer.value = value
    transfer.save()

    let systemstate = system.getSystemState(event)
    systemstate.daiTotalSupply = systemstate.daiTotalSupply.minus(value)
    systemstate.save()

    users.minusBalanceERC20Dai(event.params.src, value)
  } else {
    // TRANSFER
    transfer.from = event.params.src.toHex()
    transfer.to = event.params.dst.toHex()
    transfer.value = value
    transfer.save()

    users.commitBalanceERC20Dai(event.params.src, event.params.dst, value)
  }
}

export function handleApproval(event: Approval): void {
  let id = event.params.src.toHexString() + '-' + event.params.guy.toHexString()
  let approval = DaiApprovals.loadOrCreateDaiApproval(id, event)
  approval.owner = event.params.src.toHexString()
  approval.spender = event.params.guy.toHexString()
  approval.value = units.fromWad(event.params.wad)

  approval.save()
}
