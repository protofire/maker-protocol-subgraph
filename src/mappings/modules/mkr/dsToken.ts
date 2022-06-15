import { units } from '@protofire/subgraph-toolkit'
import { MkrApproval, MkrTransfer } from '../../../../generated/schema'
import {
  Transfer as TransferEvent,
  Approval as ApprovalEvent,
  Mint as MintEvent,
  Burn as BurnEvent,
} from '../../../../generated/Token/DSToken'
import { system as systemState, users } from '../../../entities'

export function handleTransfer(event: TransferEvent): void {
  let from = event.params.from
  let to = event.params.to
  let value = event.params.value
  let amount = units.fromWad(value)

  let mkrMoveLogId = from
    .toString()
    .concat('-')
    .concat(to.toString())
    .concat('-')
    .concat(event.transaction.hash.toHex())

  let srcUser = users.getOrCreateUser(from)
  srcUser.totalMkrBalance = srcUser.totalMkrBalance.minus(amount)

  let dstUser = users.getOrCreateUser(to)
  dstUser.totalMkrBalance = dstUser.totalMkrBalance.plus(amount)

  let transfer = new MkrTransfer(mkrMoveLogId)
  transfer.src = srcUser.id
  transfer.dst = dstUser.id
  transfer.amount = amount
  transfer.block = event.block.number
  transfer.transaction = event.transaction.hash
  transfer.timestamp = event.block.timestamp

  transfer.save()
  srcUser.save()
  dstUser.save()
}

export function handleApproval(event: ApprovalEvent): void {
  let owner = event.params.owner
  let spender = event.params.spender
  let value = event.params.value

  let amount = units.fromWad(value)

  let id = owner
    .toString()
    .concat('-')
    .concat(spender.toString())

  let mkrApproval = new MkrApproval(id)
  mkrApproval.owner = owner.toHexString()
  mkrApproval.spender = spender.toHexString()
  mkrApproval.amount = amount
  mkrApproval.createdAt = event.block.timestamp
  mkrApproval.updatedAt = event.block.timestamp
  mkrApproval.save()
}

export function handleMint(event: MintEvent): void {
  let guy = event.params.guy
  let wad = event.params.wad

  let amount = units.fromWad(wad)

  let user = users.getOrCreateUser(guy)
  user.totalMkrBalance = user.totalMkrBalance.plus(amount)
  user.save()

  let system = systemState.getSystemState(event)
  system.totalMkr = system.totalMkr.plus(amount)
  system.save()
}

export function handleBurn(event: BurnEvent): void {
  let guy = event.params.guy
  let wad = event.params.wad

  let amount = units.fromWad(wad)

  let user = users.getOrCreateUser(guy)
  user.totalMkrBalance = user.totalMkrBalance.minus(amount)
  user.save()

  let system = systemState.getSystemState(event)
  system.totalMkr = system.totalMkr.minus(amount)
  system.save()
}
