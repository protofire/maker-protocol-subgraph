import { Address, Bytes } from '@graphprotocol/graph-ts'
import { bytes, integer, decimal } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Vat/Vat'
import { CollateralType, Vault, UserProxy } from '../../../../generated/schema'

import { getSystemState } from '../../../entities'

// Register a new collateral type
export function handleInit(event: LogNote): void {
  let collateral = new CollateralType(event.params.arg1.toString())
  collateral.debtCeiling = decimal.ZERO
  collateral.vaultDebtFloor = decimal.ZERO
  collateral.totalDebt = decimal.ZERO

  collateral.auctionCount = integer.ZERO
  collateral.auctionDuration = integer.fromNumber(172800) // 2 days
  collateral.bidDuration = integer.fromNumber(10800) // 3 hours
  collateral.minimumBidIncrease = decimal.fromNumber(1.05) // 5% minimum bid increase

  collateral.liquidationLotSize = decimal.ZERO
  collateral.liquidationPenalty = decimal.ZERO
  collateral.liquidationRatio = decimal.ZERO

  collateral.rate = decimal.ZERO

  collateral.stabilityFee = decimal.ONE

  collateral.unmanagedVaultCount = integer.ZERO
  collateral.vaultCount = integer.ZERO

  collateral.addedAt = event.block.timestamp
  collateral.addedAtBlock = event.block.number
  collateral.addedAtTransaction = event.transaction.hash

  collateral.save()

  // Update system state
  let state = getSystemState(event)
  state.collateralCount = state.collateralCount.plus(integer.ONE)
  state.save()
}

// Modify collateral type parameters
export function handleFile(event: LogNote): void {
  let signature = event.params.sig.toHexString()
  let system = getSystemState(event)

  if (signature == '0x29ae8114') {
    let what = event.params.arg1.toString()
    let data = bytes.toUnsignedInt(event.params.arg2)

    if (what == 'Line') {
      system.totalDebtCeiling = decimal.fromRad(data)
    }
  } else if (signature == '0x1a0b287e') {
    let ilk = event.params.arg1.toString()
    let what = event.params.arg2.toString()
    let data = bytes.toUnsignedInt(event.params.arg3)

    let collateral = CollateralType.load(ilk)

    if (collateral != null) {
      if (what == 'spot') {
        // Spot price is stored on the current price object
      } else if (what == 'line') {
        collateral.debtCeiling = decimal.fromRad(data)
      } else if (what == 'dust') {
        collateral.vaultDebtFloor = decimal.fromRad(data)
      }

      collateral.modifiedAt = event.block.timestamp
      collateral.modifiedAtBlock = event.block.number
      collateral.modifiedAtTransaction = event.transaction.hash

      collateral.save()
    }
  }

  system.save()
}

// Modify a user's collateral balance
export function handleSlip(event: LogNote): void {
  // TODO
}

// Transfer collateral between users
export function handleFlux(event: LogNote): void {
  // TODO
}

// Transfer stablecoin between users
export function handleMove(event: LogNote): void {
  // TODO
}

// Create or modify a Vault
export function handleFrob(event: LogNote): void {
  let ilk = event.params.arg1.toString()
  let urn = bytes.toAddress(event.params.arg2)
  let dink = bytes.toSignedInt(<Bytes>event.params.data.subarray(132, 164))
  let dart = bytes.toSignedInt(<Bytes>event.params.data.subarray(164, 196))

  let collateral = CollateralType.load(ilk)

  if (collateral != null) {
    let debt = decimal.fromWad(dart)
    let collateralBalance = decimal.fromWad(dink)

    let vaultId = urn.toHexString() + '-' + ilk
    let vault = Vault.load(vaultId)

    let system = getSystemState(event)

    if (vault == null) {
      // Register new unmanaged vault
      let proxy = UserProxy.load(urn.toHexString())

      vault = new Vault(vaultId)
      vault.collateralType = collateral.id
      vault.collateral = decimal.ZERO
      vault.debt = decimal.ZERO
      vault.handler = urn

      vault.owner = proxy != null ? Address.fromString(proxy.owner) : urn

      vault.openedAt = event.block.timestamp
      vault.openedAtBlock = event.block.number
      vault.openedAtTransaction = event.transaction.hash

      collateral.unmanagedVaultCount = collateral.unmanagedVaultCount.plus(integer.ONE)

      system.unmanagedVaultCount = system.unmanagedVaultCount.plus(integer.ONE)
    } else {
      // Update existing Vault
      vault.collateral = vault.collateral.plus(collateralBalance)
      vault.debt = vault.debt.plus(debt)

      vault.modifiedAt = event.block.timestamp
      vault.modifiedAtBlock = event.block.number
      vault.modifiedAtTransaction = event.transaction.hash
    }

    collateral.totalDebt = collateral.totalDebt.plus(debt)

    collateral.modifiedAt = event.block.timestamp
    collateral.modifiedAtBlock = event.block.number
    collateral.modifiedAtTransaction = event.transaction.hash

    vault.save()
    collateral.save()
    system.save()
  }
}

// Split a Vault - binary approval or splitting/merging Vaults
export function handleFork(event: LogNote): void {
  // TODO
}

// Liquidate a Vault
export function handleGrab(event: LogNote): void {
  // TODO
}

// Create/destroy equal quantities of stablecoin and system debt
export function handleHeal(event: LogNote): void {
  let rad = decimal.fromRad(bytes.toUnsignedInt(event.params.arg1))

  let system = getSystemState(event)
  system.totalDebt = system.totalDebt.minus(rad)
  system.save()
}

// Mint unbacked stablecoin
export function handleSuck(event: LogNote): void {
  let rad = decimal.fromRad(bytes.toUnsignedInt(event.params.arg3))

  let system = getSystemState(event)
  system.totalDebt = system.totalDebt.plus(rad)
  system.save()
}

// Modify the debt multiplier, creating/destroying corresponding debt
export function handleFold(event: LogNote): void {
  let ilk = event.params.arg1.toString()
  let rate = decimal.fromRay(bytes.toSignedInt(event.params.arg3))

  let collateral = CollateralType.load(ilk)

  if (collateral != null) {
    let rad = collateral.totalDebt.times(rate)

    collateral.rate = collateral.rate.plus(rate)
    collateral.save()

    let system = getSystemState(event)
    system.totalDebt = system.totalDebt.plus(rad)
    system.save()
  }
}
