import { Address, BigInt } from '@graphprotocol/graph-ts'
import { test, assert, clearStore, describe } from 'matchstick-as'
import { tests } from '../../../../../src/mappings/modules/tests'
import { Redo as RedoEvent } from '../../../../../generated/Clipper/Clipper'
import { handleRedo } from '../../../../../src/mappings/modules/liquidation/clipper'
import { saleAuctions } from '../../../../../src/entities'

function createSaleAuction(id: BigInt, event: RedoEvent): void {
  let idStr = id.toString()

  event.block.timestamp = BigInt.fromI32(1)
  let saleAuction = saleAuctions.loadOrCreateSaleAuction(idStr, event)

  saleAuction.save()
}

describe('Clipper#handleRedo', () => {
  test('Update the fields resetedAt and startingPrice from SaleAuction entity', () => {
    let id = BigInt.fromString('2')
    let top = BigInt.fromString('10000000000000000000000000000') // 10 ray
    let tab = BigInt.fromString('5000000000000000000000000000000000000000000000') // 5 rad
    let lot = BigInt.fromString('101000000000000000000') // 101 wad
    let usr = Address.fromString('0x0000000000000000000000000000000000001111')
    let kpr = Address.fromString('0x000000000000000000000000000000000000aaaa')
    let coin = BigInt.fromString('0')

    let event = changetype<RedoEvent>(
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

    createSaleAuction(id, event)

    event.block.timestamp = BigInt.fromI32(1001)

    handleRedo(event)

    assert.fieldEquals('SaleAuction', id.toString(), 'resetedAt', '1001')
    assert.fieldEquals('SaleAuction', id.toString(), 'updatedAt', '1001')
    assert.fieldEquals('SaleAuction', id.toString(), 'startedAt', '1')
    assert.fieldEquals('SaleAuction', id.toString(), 'startingPrice', '10')

    clearStore()
  })

  describe('When SaleAuction does not exist', () => {
    test('Does not create SaleAuction', () => {
      let id = BigInt.fromString('2')
      let top = BigInt.fromString('10000000000000000000000000000') // 10 ray
      let tab = BigInt.fromString('5000000000000000000000000000000000000000000000') // 5 rad
      let lot = BigInt.fromString('101000000000000000000') // 101 wad
      let usr = Address.fromString('0x0000000000000000000000000000000000001111')
      let kpr = Address.fromString('0x000000000000000000000000000000000000aaaa')
      let coin = BigInt.fromString('0')

      let event = changetype<RedoEvent>(
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

      handleRedo(event)

      assert.notInStore('SaleAuction', id.toString())

      clearStore()
    })
  })
})
