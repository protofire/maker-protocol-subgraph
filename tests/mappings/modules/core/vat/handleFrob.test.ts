import { Bytes, BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { decimal, integer } from '@protofire/subgraph-toolkit'
import { test, assert, clearStore, describe, afterEach, beforeEach } from 'matchstick-as'
import { CollateralType, Vault } from '../../../../../generated/schema'
import { LogNote } from '../../../../../generated/Vat/Vat'
import { handleFrob } from '../../../../../src/mappings/modules/core/vat'
import { tests } from '../../../../../src/mappings/modules/tests'

function createEvent(
  signature: string,
  collateralTypeId: string,
  urnId: string,
  v: string,
  w: string,
  dink: string,
  dart: string,
): LogNote {
  let a = new Bytes(100 + 32 - 20)
  let b = a.concat(Address.fromHexString(w))
  let c = b.concat(new Bytes(32 - 9))
  let d = c.concat(Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(dink)).reverse()))
  let e = d.concat(new Bytes(32 - 9))
  let f = e.concat(Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(dart)).reverse()))

  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString(signature))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(collateralTypeId))
  let arg2 = tests.helpers.params.getBytes('arg2', Bytes.fromHexString(urnId))
  let arg3 = tests.helpers.params.getBytes('arg3', Address.fromHexString(v))
  let data = tests.helpers.params.getBytes('data', f)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2, arg3, data]))

  return event
}

let signature = '0x1a0b287e'
let collateralTypeId: string
let collateralType: CollateralType
let vaultId: string
let vault: Vault
let urnId: string

describe('Vat#handleFrob', () => {
  afterEach(() => {
    clearStore()
  })

  describe('when collateralType exist', () => {
    beforeEach(() => {
      collateralTypeId = 'c1'
      collateralType = new CollateralType(collateralTypeId)
      collateralType.rate = BigDecimal.fromString('1.5')
      collateralType.save()
    })

    describe('and vault exist', () => {
      beforeEach(() => {
        urnId = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'
        vaultId = urnId + '-' + collateralTypeId
        vault = new Vault(vaultId)
        vault.collateral = BigDecimal.fromString('1000.30')
        vault.debt = BigDecimal.fromString('50.5')
        vault.save()
      })

      test('updates both', () => {
        let v = '0x35d1b3f3d7966a1dfe207aa4514c100000000000'
        let w = '0x35d1b3f3d7966a1dfe207aa4514c111111111111'

        let dink = '100500000000000000000'
        let dart = '200500000000000000000'

        let collateralId = v.concat('-').concat(collateralTypeId)

        let event = createEvent(signature, collateralTypeId, urnId, v, w, dink, dart)

        handleFrob(event)

        // test mapper is not creating new entities
        assert.entityCount('CollateralType', 1)
        assert.entityCount('Vault', 1)

        // test Vault updates
        assert.fieldEquals(
          'Vault',
          vaultId,
          'collateral',
          vault.collateral.plus(BigDecimal.fromString('100.5')).toString(),
        )
        assert.fieldEquals('Vault', vaultId, 'debt', vault.debt.plus(BigDecimal.fromString('200.5')).toString())
        assert.fieldEquals('Vault', vaultId, 'updatedAt', event.block.timestamp.toString())
        assert.fieldEquals('Vault', vaultId, 'updatedAtBlock', event.block.number.toString())
        assert.fieldEquals('Vault', vaultId, 'updatedAtTransaction', event.transaction.hash.toHexString())

        // test CollateralType updates
        assert.fieldEquals(
          'CollateralType',
          collateralTypeId,
          'totalCollateral',
          BigDecimal.fromString('100.5').toString(),
        )
        assert.fieldEquals(
          'CollateralType',
          collateralTypeId,
          'debtNormalized',
          BigDecimal.fromString('200.5').toString(),
        )
        assert.fieldEquals(
          'CollateralType',
          collateralTypeId,
          'totalDebt',
          BigDecimal.fromString('200.5')
            .times(collateralType.rate)
            .toString(),
        )

        assert.fieldEquals('User', w, 'totalVaultDai', '300.75')
        assert.fieldEquals('Collateral', collateralId, 'amount', '-100.5')
      })
    })

    describe('and vault does not exist', () => {
      test('creates vault and updates collateralType', () => {
        urnId = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'
        let v = '0x35d1b3f3d7966a1dfe207aa4514c100000000000'
        let w = '0x35d1b3f3d7966a1dfe207aa4514c111111111111'

        vaultId = urnId + '-' + collateralTypeId
        let dink = '100500000000000000000'
        let dart = '200500000000000000000'
        let event = createEvent(signature, collateralTypeId, urnId, v, w, dink, dart)

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
        assert.fieldEquals(
          'CollateralType',
          collateralTypeId,
          'totalCollateral',
          BigDecimal.fromString('100.5').toString(),
        )
        assert.fieldEquals(
          'CollateralType',
          collateralTypeId,
          'debtNormalized',
          BigDecimal.fromString('200.5').toString(),
        )
        assert.fieldEquals(
          'CollateralType',
          collateralTypeId,
          'totalDebt',
          BigDecimal.fromString('200.5')
            .times(collateralType.rate)
            .toString(),
        )
        assert.fieldEquals('CollateralType', collateralTypeId, 'unmanagedVaultCount', integer.ONE.toString())
      })
    })
  })

  describe('when collateralType does not exist', () => {
    test('does nothing', () => {
      urnId = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'

      let v = '0x35d1b3f3d7966a1dfe207aa4514c100000000000'
      let w = '0x35d1b3f3d7966a1dfe207aa4514c111111111111'

      let dink = '100500000000000000000'
      let dart = '200500000000000000000'
      let event = createEvent(signature, collateralTypeId, urnId, v, w, dink, dart)

      handleFrob(event)

      // test nothing is created
      assert.entityCount('CollateralType', 0)
      assert.entityCount('Vault', 0)
    })
  })
})
