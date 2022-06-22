import { BigInt, BigDecimal, log } from '@graphprotocol/graph-ts'
import { Dai, Approval, Transfer } from '../../../../generated/Dai/Dai'
import { daiTransfers } from '../../../entities/daiTransfer'
import { address, units } from '@protofire/subgraph-toolkit'
import { system } from '../../../entities/System'
import { daiApprovals } from '../../../entities/daiApproval'
import { users } from '../../../entities'

export function handleTransfer(event: Transfer): void {
  let amount = units.fromWad(event.params.wad)
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let transfer = daiTransfers.getOrCreateDaiTransfer(id, event)

  if (address.isZeroAddress(event.params.src)) {
    // MINT
    transfer.src = event.params.src.toHex()
    transfer.dst = event.params.dst.toHex()
    transfer.amount = amount
    transfer.save()

    let systemstate = system.getSystemState(event)
    systemstate.daiTotalSupply = systemstate.daiTotalSupply.plus(amount)
    systemstate.save()

    users.plusBalanceERC20Dai(event.params.dst, amount)
  } else if (address.isZeroAddress(event.params.dst)) {
    // BURN
    transfer.src = event.params.src.toHex()
    transfer.dst = event.params.dst.toHex()
    transfer.amount = amount
    transfer.save()

    let systemstate = system.getSystemState(event)
    systemstate.daiTotalSupply = systemstate.daiTotalSupply.minus(amount)
    systemstate.save()

    users.minusBalanceERC20Dai(event.params.src, amount)
  } else {
    // TRANSFER
    transfer.src = event.params.src.toHex()
    transfer.dst = event.params.dst.toHex()
    transfer.amount = amount
    transfer.save()

    users.commitBalanceERC20Dai(event.params.src, event.params.dst, amount)
  }
}

export function handleApproval(event: Approval): void {
  let id = event.params.src.toHexString() + '-' + event.params.guy.toHexString()
  let approval = daiApprovals.getOrCreateDaiApproval(id, event)
  approval.owner = event.params.src.toHexString()
  approval.spender = event.params.guy.toHexString()
  approval.amount = units.fromWad(event.params.wad)
  approval.updatedAt = event.block.timestamp

  approval.save()
}
