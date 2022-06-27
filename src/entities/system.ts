import { ethereum, Address } from '@graphprotocol/graph-ts'
import { decimal, integer, units } from '@protofire/subgraph-toolkit'

import { SystemState } from '../../generated/schema'
import { Vat } from '../../generated/Vat/Vat'
export namespace system {
  export function getSystemState(event: ethereum.Event): SystemState {
    let vatContract = Vat.bind(Address.fromString('0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'))
    let state = SystemState.load('current')

    if (state == null) {
      state = new SystemState('current')

      state.totalDebt = decimal.ZERO
      state.totalSystemDebt = decimal.ZERO // Unbacked Dai

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

      // DAI Erc.20 parameters
      state.daiTotalSupply = decimal.ZERO

      // pot parameters
      state.dsrLiveLastUpdateAt = event.block.timestamp
      state.dsrLive = true

      // dog parameters
      state.totalAuctionDebtAndFees = decimal.ZERO
    }

    // Hotfix for totalDebt
    let debt = vatContract.try_debt()
    state.totalDebt = debt.reverted ? state.totalDebt : units.fromRad(debt.value)
    state.block = event.block.number
    state.timestamp = event.block.timestamp
    state.transaction = event.transaction.hash

    return state as SystemState
  }
}
