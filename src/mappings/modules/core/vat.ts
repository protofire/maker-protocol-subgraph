import { Bytes } from '@graphprotocol/graph-ts'
import { bytes, integer, decimal, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Vat/Vat'

import {
  CollateralType,
  Vault,
  VaultCreationLog,
  VaultCollateralChangeLog,
  VaultDebtChangeLog,
  VaultSplitChangeLog,
} from '../../../../generated/schema'

import { getOrCreateUser, getSystemState } from '../../../entities'

// Register a new collateral type
export function handleInit(event: LogNote): void {
  let collateral = new CollateralType(event.params.arg1.toString())
  collateral.debtCeiling = decimal.ZERO
  collateral.vaultDebtFloor = decimal.ZERO
  collateral.totalDebt = decimal.ZERO
  collateral.debtNormalized = decimal.ZERO

  collateral.auctionCount = integer.ZERO
  collateral.auctionDuration = integer.fromNumber(172800) // 2 days
  collateral.bidDuration = integer.fromNumber(10800) // 3 hours
  collateral.minimumBidIncrease = decimal.fromNumber(1.05) // 5% minimum bid increase

  collateral.liquidationLotSize = decimal.ZERO
  collateral.liquidationPenalty = decimal.ZERO
  collateral.liquidationRatio = decimal.ZERO

  collateral.rate = decimal.ONE

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
      system.totalDebtCeiling = units.fromRad(data)
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
        collateral.debtCeiling = units.fromRad(data)
      } else if (what == 'dust') {
        collateral.vaultDebtFloor = units.fromRad(data)
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
    let system = getSystemState(event)

    let Δdebt = units.fromWad(dart)
    let Δcollateral = units.fromWad(dink)

    let vault = Vault.load(urn.toHexString() + '-' + collateral.id)

    if (vault == null) {
      let owner = getOrCreateUser(urn)
      owner.vaultCount = owner.vaultCount.plus(integer.ONE)
      owner.save()

      // Register new unmanaged vault
      vault = new Vault(urn.toHexString() + '-' + collateral.id)
      vault.collateralType = collateral.id
      vault.collateral = decimal.ZERO
      vault.debt = decimal.ZERO
      vault.handler = urn
      vault.owner = owner.id

      vault.openedAt = event.block.timestamp
      vault.openedAtBlock = event.block.number
      vault.openedAtTransaction = event.transaction.hash

      collateral.unmanagedVaultCount = collateral.unmanagedVaultCount.plus(integer.ONE)

      system.unmanagedVaultCount = system.unmanagedVaultCount.plus(integer.ONE)

      // Log vault creation
      let log = new VaultCreationLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
      log.vault = vault.id

      log.block = event.block.number
      log.timestamp = event.block.timestamp
      log.transaction = event.transaction.hash

      log.save()
    } else {
      let previousCollateral = vault.collateral
      let previousDebt = vault.debt

      // Update existing Vault
      vault.collateral = vault.collateral.plus(Δcollateral)
      // We are adding normalized debt values. Not sure whether multiplying by rate works here.
      vault.debt = vault.debt.plus(Δdebt)

      vault.modifiedAt = event.block.timestamp
      vault.modifiedAtBlock = event.block.number
      vault.modifiedAtTransaction = event.transaction.hash

      if (!Δcollateral.equals(decimal.ZERO)) {
        let log = new VaultCollateralChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-1')
        log.vault = vault.id
        log.collateralBefore = previousCollateral
        log.collateralAfter = vault.collateral
        log.collateralDiff = Δcollateral

        log.block = event.block.number
        log.timestamp = event.block.timestamp
        log.transaction = event.transaction.hash

        log.save()
      }

      if (!Δdebt.equals(decimal.ZERO)) {
        let log = new VaultDebtChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-2')
        log.vault = vault.id
        log.debtBefore = previousDebt
        log.debtAfter = vault.debt
        log.debtDiff = Δdebt

        log.block = event.block.number
        log.timestamp = event.block.timestamp
        log.transaction = event.transaction.hash

        log.save()
      }
    }

    // Debt normalized should coincide with Ilk.Art
    collateral.debtNormalized = collateral.debtNormalized.plus(Δdebt)
    // Total debt is Art * rate (like on DAIStats)
    collateral.totalDebt = collateral.debtNormalized * collateral.rate

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
  let ilk = event.params.arg1.toString()
  let src = bytes.toAddress(event.params.arg2)
  let dst = bytes.toAddress(event.params.arg3)
  let dink = bytes.toSignedInt(<Bytes>event.params.data.subarray(100, 132))
  let dart = bytes.toSignedInt(<Bytes>event.params.data.subarray(132, 164))

  let log = new VaultSplitChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-3')
  log.src = src
  log.dst = dst
  log.collateralToMove = units.fromWad(dink)
  log.debtToMove = units.fromWad(dart)

  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

// Liquidate a Vault
export function handleGrab(event: LogNote): void {
  let ilk = event.params.arg1.toString()
  // let urn = bytes.toAddress(event.params.arg2)
  // let dink = bytes.toSignedInt(<Bytes>event.params.data.subarray(132, 164))
  let dart = bytes.toSignedInt(<Bytes>event.params.data.subarray(164, 196))

  let collateral = CollateralType.load(ilk)

  // TODO: Reset Vault

  if (collateral != null) {
    let Δdebt = units.fromWad(dart)

    // Debt normalized should coincide with Ilk.Art
    collateral.debtNormalized = collateral.debtNormalized.plus(Δdebt)
    // Total debt is Art * rate (like on DAIStats)
    collateral.totalDebt = collateral.debtNormalized * collateral.rate

    collateral.save()
  }
}

// Create/destroy equal quantities of stablecoin and system debt
export function handleHeal(event: LogNote): void {
  let rad = units.fromRad(bytes.toUnsignedInt(event.params.arg1))

  let system = getSystemState(event)
  system.totalDebt = system.totalDebt.minus(rad)
  system.save()
}

// Mint unbacked stablecoin
export function handleSuck(event: LogNote): void {
  let rad = units.fromRad(bytes.toUnsignedInt(event.params.arg3))

  let system = getSystemState(event)
  system.totalDebt = system.totalDebt.plus(rad)
  system.save()
}

// Modify the debt multiplier, creating/destroying corresponding debt
export function handleFold(event: LogNote): void {
  let ilk = event.params.arg1.toString()
  let rate = units.fromRay(bytes.toSignedInt(event.params.arg3))

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
