import { Bytes, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { decimal, integer } from '@protofire/subgraph-toolkit'
import { test, assert, clearStore } from 'matchstick-as'
import { CollateralType, Vault } from '../../../../../generated/schema'
import { LogNote } from '../../../../../generated/Vat/Vat'
import { handleFrob } from '../../../../../src/mappings/modules/core/vat'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'

// handleFrob
// when collateralType exist
//   and vault exist
//     it updates collateralType and Vault
//   and vault does not exist
//     it creates vault and update collateralType
// when collateralType does not exist
//   it does nothing

function createEvent(signature: string, collateralTypeId: string, urnId: string, dink: Bytes, dart: Bytes): LogNote {
  let a = new Bytes(132 + 32 - 9)
  let b = a.concat(dink) // 9
  let d = b.concat(dart)

  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString(signature))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(collateralTypeId))
  let arg2 = tests.helpers.params.getBytes('arg2', Bytes.fromHexString(urnId))
  let arg3 = tests.helpers.params.getBytes('arg3', Bytes.fromHexString(urnId))
  let data = tests.helpers.params.getBytes('data', d)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2, arg3, data]))

  return event
}

test('Vat#handleFrob: when both collateralType and vault exist, it updates both', () => {
  let signature = '0x1a0b287e'
  let collateralTypeId = 'c1'
  let collateralType = new CollateralType(collateralTypeId)
  collateralType.rate = BigDecimal.fromString('1.5')
  collateralType.save()
  let urnId = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'
  let vaultId = urnId + '-' + collateralTypeId
  let vault = new Vault(vaultId)
  vault.collateral = BigDecimal.fromString('1000.30')
  vault.debt = BigDecimal.fromString('50.5')
  vault.save()
  let dink = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString('100500000000000000000')).reverse())
  let dart = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString('200500000000000000000')).reverse())
  let event = createEvent(signature, collateralTypeId, urnId, dink, dart)

  mockDebt()
  handleFrob(event)

  // test mapper is not creating new entities
  assert.entityCount('CollateralType', 1)
  assert.entityCount('Vault', 1)

  // test Vault updates
  assert.fieldEquals('Vault', vaultId, 'collateral', vault.collateral.plus(BigDecimal.fromString('100.5')).toString())
  assert.fieldEquals('Vault', vaultId, 'debt', vault.debt.plus(BigDecimal.fromString('200.5')).toString())
  assert.fieldEquals('Vault', vaultId, 'updatedAt', event.block.timestamp.toString())
  assert.fieldEquals('Vault', vaultId, 'updatedAtBlock', event.block.number.toString())
  assert.fieldEquals('Vault', vaultId, 'updatedAtTransaction', event.transaction.hash.toHexString())

  // test CollateralType updates
  assert.fieldEquals('CollateralType', collateralTypeId, 'totalCollateral', BigDecimal.fromString('100.5').toString())
  assert.fieldEquals('CollateralType', collateralTypeId, 'debtNormalized', BigDecimal.fromString('200.5').toString())
  assert.fieldEquals(
    'CollateralType',
    collateralTypeId,
    'totalDebt',
    BigDecimal.fromString('200.5').times(collateralType.rate).toString(),
  )

  clearStore()
})

test('Vat#handleFrob: when collateralType exist but vault does not exist, it creates vault and updates collateralType', () => {
  let signature = '0x1a0b287e'
  let collateralTypeId = 'c1'
  let collateralType = new CollateralType(collateralTypeId)
  collateralType.rate = BigDecimal.fromString('1.5')
  collateralType.save()
  let urnId = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'
  let vaultId = urnId + '-' + collateralTypeId
  let dink = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString('100500000000000000000')).reverse())
  let dart = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString('200500000000000000000')).reverse())
  let event = createEvent(signature, collateralTypeId, urnId, dink, dart)

  handleFrob(event)

  // test creates user
  assert.fieldEquals('User', urnId, 'vaultCount', integer.ONE.toString())

  // test vault created from collateralType
  assert.fieldEquals('Vault', vaultId, 'collateralType', collateralTypeId)
  assert.fieldEquals('Vault', vaultId, 'collateral', decimal.ZERO.toString())
  assert.fieldEquals('Vault', vaultId, 'debt', decimal.ZERO.toString())
  assert.fieldEquals('Vault', vaultId, 'owner', urnId)
  assert.fieldEquals('Vault', vaultId, 'handler', urnId)
  assert.fieldEquals('Vault', vaultId, 'openedAt', event.block.timestamp.toString())
  assert.fieldEquals('Vault', vaultId, 'openedAtBlock', event.block.number.toString())
  assert.fieldEquals('Vault', vaultId, 'openedAtTransaction', event.transaction.hash.toHexString())

  // test CollateralType updates
  assert.fieldEquals('CollateralType', collateralTypeId, 'totalCollateral', BigDecimal.fromString('100.5').toString())
  assert.fieldEquals('CollateralType', collateralTypeId, 'debtNormalized', BigDecimal.fromString('200.5').toString())
  assert.fieldEquals(
    'CollateralType',
    collateralTypeId,
    'totalDebt',
    BigDecimal.fromString('200.5').times(collateralType.rate).toString(),
  )
  assert.fieldEquals('CollateralType', collateralTypeId, 'unmanagedVaultCount', integer.ONE.toString())

  clearStore()
})

test('Vat#handleFrob: when collateralType does not exist, it does nothing', () => {
  let signature = '0x1a0b287e'
  let collateralTypeId = 'c1'
  let urnId = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'
  let dink = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString('100500000000000000000')).reverse())
  let dart = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString('200500000000000000000')).reverse())
  let event = createEvent(signature, collateralTypeId, urnId, dink, dart)

  handleFrob(event)

  // test nothing is created
  assert.entityCount('CollateralType', 0)
  assert.entityCount('Vault', 0)
})
