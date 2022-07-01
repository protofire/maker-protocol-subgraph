import { ethereum } from '@graphprotocol/graph-ts'
import { decimal } from '@protofire/subgraph-toolkit'
import { Collateral } from '../../generated/schema'
export namespace collaterals {
  function getGemId(ilk: string, user: string): string {
    return `${user}-${ilk}`
  }

  export function loadOrCreateCollateral(event: ethereum.Event, ilk: string, owner: string): Collateral {
    let id = getGemId(ilk, owner)
    let entity = Collateral.load(id)
    if (entity == null) {
      entity = new Collateral(id)
      entity.type = ilk
      entity.amount = decimal.ZERO
      entity.createdAt = event.block.timestamp
      entity.createdAtBlock = event.block.number
      entity.createdAtTransaction = event.transaction.hash
      entity.modifiedAt = event.block.timestamp
      entity.modifiedAtBlock = event.block.number
      entity.modifiedAtTransaction = event.transaction.hash
    }
    return entity as Collateral
  }
}
