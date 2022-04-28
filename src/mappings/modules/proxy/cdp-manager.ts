import { Address } from '@graphprotocol/graph-ts'
import { bytes, integer, decimal } from '@protofire/subgraph-toolkit'

import { DssCdpManager, NewCdp, LogNote } from '../../../../generated/CdpManager/DssCdpManager'
import { CollateralType, Vault, VaultCreationLog, VaultTransferChangeLog } from '../../../../generated/schema'

import { users, system as systemModule } from '../../../entities'

// Open a new CDP for a given user
export function handleOpen(event: NewCdp): void {
  let manager = DssCdpManager.bind(event.address)
  let ilk = manager.ilks(event.params.cdp)
  let urn = manager.urns(event.params.cdp)

  let collateral = CollateralType.load(ilk.toString())

  if (collateral != null) {
    let owner = users.getOrCreateUser(event.params.own)
    owner.vaultCount = owner.vaultCount.plus(integer.ONE)
    owner.save()

    // Register new vault
    let vault = new Vault(urn.toHexString() + '-' + collateral.id)
    vault.cdpId = event.params.cdp
    vault.collateralType = collateral.id
    vault.collateral = decimal.ZERO
    vault.debt = decimal.ZERO
    vault.handler = urn
    vault.owner = owner.id

    vault.openedAt = event.block.timestamp
    vault.openedAtBlock = event.block.number
    vault.openedAtTransaction = event.transaction.hash

    // Update vault counter
    collateral.vaultCount = collateral.vaultCount.plus(integer.ONE)

    vault.save()
    collateral.save()

    // Log vault creation
    let log = new VaultCreationLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
    log.vault = vault.id

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }

  // Update system state
  let system = systemModule.getSystemState(event)
  system.vaultCount = system.vaultCount.plus(integer.ONE)
  system.save()
}

// Give the CDP ownership to a another address
export function handleGive(event: LogNote): void {
  let cdp = bytes.toUnsignedInt(event.params.arg1)
  let dst = bytes.toAddress(event.params.arg2)

  let manager = DssCdpManager.bind(event.address)
  let ilk = manager.ilks(cdp)
  let urn = manager.urns(cdp)

  let vault = Vault.load(urn.toHexString() + '-' + ilk.toString())

  if (vault != null) {
    let previousOwner = users.getOrCreateUser(Address.fromString(vault.owner))
    let nextOwner = users.getOrCreateUser(dst)

    // Transfer ownership
    vault.owner = nextOwner.id
    vault.save()

    previousOwner.vaultCount = previousOwner.vaultCount.minus(integer.ONE)
    previousOwner.save()

    nextOwner.vaultCount = nextOwner.vaultCount.plus(integer.ONE)
    nextOwner.save()

    // Log vault transfer
    let log = new VaultTransferChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-3')
    log.vault = vault.id
    log.previousOwner = previousOwner.id
    log.nextOwner = nextOwner.id

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }
}
