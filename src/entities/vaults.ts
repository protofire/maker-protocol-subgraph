import { Address } from '@graphprotocol/graph-ts'
import { decimal } from '@protofire/subgraph-toolkit'
import { Vault } from '../../generated/schema'

export namespace vaults {
  export function getVaultId(urn: string, ilk: string): string {
    // Urn storage urn = urns[i][u];
    return `${urn}-${ilk}`
  }
  export function loadOrCreateVault(urn: Address, ilk: string, owner: string): Vault {
    let id = getVaultId(urn.toHexString(), ilk)
    let entity = Vault.load(id)
    if (entity == null) {
      entity = new Vault(id)
      entity.collateralType = ilk
      entity.collateral = decimal.ZERO
      entity.debt = decimal.ZERO
      entity.handler = urn
      entity.owner = owner
    }
    return entity as Vault
  }
}
