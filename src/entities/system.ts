import { ethereum } from '@graphprotocol/graph-ts'
import { decimal, integer } from '@protofire/subgraph-toolkit'

import { SystemState } from '../../generated/schema'

export function getSystemState(event: ethereum.Event): SystemState {
  let state = SystemState.load('current')

  if (state == null) {
    state = new SystemState('current')

    // Protocol-wide stats
    state.totalDebt = decimal.ZERO

    // Entities counters
    state.collateralCount = integer.ZERO
    state.collateralAuctionCount = integer.ZERO
    state.userProxyCount = integer.ZERO
    state.unmanagedVaultCount = integer.ZERO
    state.vaultCount = integer.ZERO

    // System parameters
    state.baseStabilityFee = decimal.ONE
    state.savingsRate = decimal.ONE
    state.totalDebtCeiling = decimal.ZERO
  }

  state.block = event.block.number
  state.timestamp = event.block.timestamp
  state.transaction = event.transaction.hash

  return state as SystemState
}
