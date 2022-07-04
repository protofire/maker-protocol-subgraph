import { Bytes, BigInt, Address, ethereum, TypedMap } from '@graphprotocol/graph-ts'
import { decimal, integer } from '@protofire/subgraph-toolkit'
import { test, clearStore } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Vat/Vat'
import { handleInit } from '../../../../../src/mappings/modules/core/vat'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'

test('Vat#handleInit creates initial CollateralType and updates SystemState', () => {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromUTF8('sig'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8('arg1'))
  let arg2 = tests.helpers.params.getBytes('arg2', Bytes.fromUTF8('arg2'))
  let arg3 = tests.helpers.params.getBytes('arg3', Bytes.fromUTF8('arg3'))
  let data = tests.helpers.params.getBytes('data', Bytes.fromUTF8('data'))

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2, arg3, data]))

  mockDebt()
  handleInit(event)

  let collateralTypeFields = new TypedMap<string, string>()
  collateralTypeFields.set('debtCeiling', decimal.ZERO.toString())
  collateralTypeFields.set('vaultDebtFloor', decimal.ZERO.toString())
  collateralTypeFields.set('totalCollateral', decimal.ZERO.toString())
  collateralTypeFields.set('totalDebt', decimal.ZERO.toString())
  collateralTypeFields.set('debtNormalized', decimal.ZERO.toString())
  collateralTypeFields.set('liquidationLotSize', decimal.ZERO.toString())
  collateralTypeFields.set('liquidationPenalty', decimal.ZERO.toString())
  collateralTypeFields.set('liquidationRatio', decimal.ZERO.toString())
  collateralTypeFields.set('rate', decimal.ONE.toString())
  collateralTypeFields.set('stabilityFee', decimal.ONE.toString())
  collateralTypeFields.set('unmanagedVaultCount', integer.ZERO.toString())
  collateralTypeFields.set('vaultCount', integer.ZERO.toString())
  collateralTypeFields.set('addedAt', event.block.timestamp.toString())
  collateralTypeFields.set('addedAtBlock', event.block.number.toString())
  collateralTypeFields.set('addedAtTransaction', event.transaction.hash.toHexString())

  tests.helpers.asserts.assertMany('CollateralType', 'arg1', collateralTypeFields)

  let systemStateFields = new TypedMap<string, string>()
  systemStateFields.set('collateralCount', integer.ONE.toString())
  systemStateFields.set('userProxyCount', integer.ZERO.toString())
  systemStateFields.set('unmanagedVaultCount', integer.ZERO.toString())
  systemStateFields.set('vaultCount', integer.ZERO.toString())
  systemStateFields.set('baseStabilityFee', decimal.ONE.toString())
  systemStateFields.set('savingsRate', decimal.ONE.toString())
  systemStateFields.set('totalDebtCeiling', decimal.ZERO.toString())
  systemStateFields.set('totalDebt', '0.0000000000000000000000000000000000000000001')
  systemStateFields.set('block', event.block.number.toString())
  systemStateFields.set('timestamp', event.block.timestamp.toString())
  systemStateFields.set('transaction', event.transaction.hash.toHexString())

  tests.helpers.asserts.assertMany('SystemState', 'current', systemStateFields)

  clearStore()
})
