import { decimal, integer } from '@protofire/subgraph-toolkit'
import { CollateralType } from '../../generated/schema'

export namespace collateralTypes {
  export function loadOrCreateCollateralType(id: string): CollateralType {
    let entity = CollateralType.load(id)
    if (entity == null) {
      entity = new CollateralType(id)
      entity.debtCeiling = decimal.ZERO
      entity.vaultDebtFloor = decimal.ZERO
      entity.totalCollateral = decimal.ZERO
      entity.totalDebt = decimal.ZERO
      entity.debtNormalized = decimal.ZERO

      entity.auctionCount = integer.ZERO
      entity.auctionDuration = integer.fromNumber(172800) // 2 days
      entity.bidDuration = integer.fromNumber(10800) // 3 hours
      entity.minimumBidIncrease = decimal.fromNumber(1.05) // 5% minimum bid increase

      entity.liquidationLotSize = decimal.ZERO
      entity.liquidationPenalty = decimal.ZERO
      entity.liquidationRatio = decimal.ZERO

      entity.rate = decimal.ONE

      entity.stabilityFee = decimal.ZERO

      entity.unmanagedVaultCount = integer.ZERO
      entity.vaultCount = integer.ZERO
      // TODO: metadata relationships
    }
    return entity as CollateralType
  }
}
