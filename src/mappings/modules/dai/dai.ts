import { Approval as ApprovalEvent, Transfer as TransferEvent } from '../../../../generated/Dai/Dai'
import { daiTransfers } from '../../../entities/daiTransfer'
import { address, units } from '@protofire/subgraph-toolkit'
import { system } from '../../../entities/System'
import { daiApprovals } from '../../../entities/daiApproval'
import { users } from '../../../entities'

export function handleTransfer(event: TransferEvent): void {
  let amount = units.fromWad(event.params.wad)
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let daiTransfer = daiTransfers.getOrCreateDaiTransfer(id, event)

  if (address.isZeroAddress(event.params.src)) {
    // MINT
    daiTransfer.src = event.params.src.toHex()
    daiTransfer.dst = event.params.dst.toHex()
    daiTransfer.amount = amount
    daiTransfer.save()

    let systemstate = system.getSystemState(event)
    systemstate.daiTotalSupply = systemstate.daiTotalSupply.plus(amount)
    systemstate.save()

    users.plusBalanceERC20Dai(event.params.dst, amount)
  } else if (address.isZeroAddress(event.params.dst)) {
    // BURN
    daiTransfer.src = event.params.src.toHex()
    daiTransfer.dst = event.params.dst.toHex()
    daiTransfer.amount = amount
    daiTransfer.save()

    let systemstate = system.getSystemState(event)
    systemstate.daiTotalSupply = systemstate.daiTotalSupply.minus(amount)
    systemstate.save()

    users.minusBalanceERC20Dai(event.params.src, amount)
  } else {
    // TRANSFER
    daiTransfer.src = event.params.src.toHex()
    daiTransfer.dst = event.params.dst.toHex()
    daiTransfer.amount = amount
    daiTransfer.save()

    users.commitBalanceERC20Dai(event.params.src, event.params.dst, amount)
  }
}

export function handleApproval(event: ApprovalEvent): void {
  let id = event.params.src.toHexString() + '-' + event.params.guy.toHexString()
  let approval = daiApprovals.getOrCreateDaiApproval(id, event)
  approval.owner = event.params.src.toHexString()
  approval.spender = event.params.guy.toHexString()
  approval.amount = units.fromWad(event.params.wad)
  approval.updatedAt = event.block.timestamp

  approval.save()
}
