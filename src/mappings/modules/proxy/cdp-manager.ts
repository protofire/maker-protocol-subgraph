import { Address, dataSource, log } from '@graphprotocol/graph-ts'

import { DssCdpManager, NewCdp } from '../../../../generated/CdpManager/DssCdpManager'
import { CollateralType, UserProxy, Vault } from '../../../../generated/schema'

import { getSystemState } from '../../../entities'

import * as decimal from '../../../utils/decimal'
import * as integer from '../../../utils/integer'

export function handleNewCdp(event: NewCdp): void {
  let manager = DssCdpManager.bind(dataSource.address())

  let ilk = manager.ilks(event.params.cdp)
  let urn = manager.urns(event.params.cdp)

  let collateral = CollateralType.load(ilk.toString())

  if (collateral != null) {
    let proxy = UserProxy.load(event.params.own.toHexString())

    // Register new vault
    let vault = new Vault(urn.toHexString() + '-' + collateral.id)
    vault.cdpId = event.params.cdp
    vault.collateralType = collateral.id
    vault.collateral = decimal.ZERO
    vault.debt = decimal.ZERO
    vault.handler = urn

    vault.owner = proxy != null ? Address.fromString(proxy.owner) : event.params.own

    vault.openedAt = event.block.timestamp
    vault.openedAtBlock = event.block.number
    vault.openedAtTransaction = event.transaction.hash

    // Update vault counter
    collateral.vaultCount = collateral.vaultCount.plus(integer.ONE)

    vault.save()
    collateral.save()
  } else {
    log.warning('Wrong collateral type, ilk: {}, cdp_id: {}, tx_hash: {}', [
      ilk.toString(),
      event.params.cdp.toString(),
      event.transaction.hash.toHexString(),
    ])
  }

  // Update system state
  let system = getSystemState(event)
  system.vaultCount = system.vaultCount.plus(integer.ONE)
  system.save()
}
