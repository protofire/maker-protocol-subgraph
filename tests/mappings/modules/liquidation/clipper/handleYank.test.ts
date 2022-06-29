import { BigInt } from '@graphprotocol/graph-ts'
import { clearStore, describe, test, beforeEach, afterEach, assert } from 'matchstick-as'
import { Yank as YankEvent } from '../../../../../generated/Clipper/Clipper'
import { tests } from '../../../../../src/mappings/modules/tests'
import { handleYank } from '../../../../../src/mappings/modules/liquidation/clipper'
import { SaleAuction } from '../../../../../generated/schema'

function createEvent(id: string): YankEvent {
  return changetype<YankEvent>(
    tests.helpers.events.getNewEvent([tests.helpers.params.getBigInt('id', BigInt.fromString(id))]),
  )
}

let saleAuctionId: string

describe('Clipper#handleYank', () => {
  afterEach(() => {
    clearStore()
  })

  describe('when SaleAuction exists', () => {
    beforeEach(() => {
      saleAuctionId = '1234'

      let saleAuction = new SaleAuction(saleAuctionId)
      saleAuction.startedAt = BigInt.fromU64(1234567)
      saleAuction.save()
    })

    test('soft deletes the SaleAuction', () => {
      let event = createEvent(saleAuctionId)

      handleYank(event)

      assert.fieldEquals('SaleAuction', saleAuctionId, 'deletedAt', event.block.timestamp.toString())
      assert.fieldEquals('SaleAuction', saleAuctionId, 'isActive', 'false')
    })
  })

  describe('when SaleAuction does not exist', () => {
    test('does not create it', () => {
      saleAuctionId = '3456'

      let event = createEvent(saleAuctionId)

      handleYank(event)

      assert.notInStore('SaleAuction', saleAuctionId)
    })
  })
})
