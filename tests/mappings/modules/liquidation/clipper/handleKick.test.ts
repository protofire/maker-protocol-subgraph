import { Address, BigInt } from '@graphprotocol/graph-ts'
import { test, assert, clearStore, describe } from 'matchstick-as'
import { tests } from '../../../../../src/mappings/modules/tests'
import { Kick } from '../../../../../generated/Clipper/Clipper'
import { handleKick } from '../../../../../src/mappings/modules/liquidation/clipper'

describe('Clipper#handleKick', () => {
  test('Creates a SaleAuction entity', () => {
    let id = BigInt.fromString('2')
    let top = BigInt.fromString('10000000000000000000000000000') // 10 ray
    let tab = BigInt.fromString('5000000000000000000000000000000000000000000000') // 5 rad
    let lot = BigInt.fromString('101000000000000000000') // 101 wad
    let usr = Address.fromString('0x0000000000000000000000000000000000001111')
    let kpr = Address.fromString('0x000000000000000000000000000000000000aaaa')
    let coin = BigInt.fromString('0')
    let event = changetype<Kick>(
      tests.helpers.events.getNewEvent([
        tests.helpers.params.getBigInt('id', id),
        tests.helpers.params.getBigInt('top', top),
        tests.helpers.params.getBigInt('tab', tab),
        tests.helpers.params.getBigInt('lot', lot),
        tests.helpers.params.getAddress('usr', usr),
        tests.helpers.params.getAddress('kpr', kpr),
        tests.helpers.params.getBigInt('coin', coin),
      ]),
    )

    event.block.timestamp = BigInt.fromI32(1001)

    handleKick(event)

    assert.fieldEquals('SaleAuction', id.toString(), 'amountDaiToRaise', '5')
    assert.fieldEquals('SaleAuction', id.toString(), 'amountCollateralToSell', '101')
    assert.fieldEquals(
      'SaleAuction',
      id.toString(),
      'userExcessCollateral',
      '0x0000000000000000000000000000000000001111',
    )
    assert.fieldEquals('SaleAuction', id.toString(), 'userIncentives', '0x000000000000000000000000000000000000aaaa')
    assert.fieldEquals('SaleAuction', id.toString(), 'startingPrice', '10')
    assert.fieldEquals('SaleAuction', id.toString(), 'updatedAt', '1001')

    clearStore()
  })
})
