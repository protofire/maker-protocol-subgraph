import { test, clearStore, describe, beforeEach, assert } from 'matchstick-as'
import { handleDrip } from '../../../../../src/mappings/modules/rates/jug'
import { LogNote } from '../../../../../generated/Jug/Jug'
import { tests } from '../../../../../src/mappings/modules/tests'
import { Bytes } from '@graphprotocol/graph-ts'
import { collateralTypes } from '../../../../../src/entities'

function createEvent(collateralTypeId: string): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x1a0b287e'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let arg2 = tests.helpers.params.getBytes('arg2', Bytes.fromUTF8(collateralTypeId))

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2]))

  return event
}

describe('Jug#handleDrip', () => {
  beforeEach(() => {
    let collateralType = collateralTypes.loadOrCreateCollateralType('c1')
    collateralType.save()
  })
  describe('when collateralType exist', () => {
    test('sets CollateralType.stabilityFeeUpdatedAt to now', () => {
      let event = createEvent('c1')

      handleDrip(event)

      assert.fieldEquals('CollateralType', 'c1', 'stabilityFeeUpdatedAt', event.block.timestamp.toString())

      clearStore()
    })
  })
  describe('when collateralType does not exist', () => {
    test('does nothing', () => {
      let event = createEvent('c2')

      handleDrip(event)

      assert.fieldEquals('CollateralType', 'c1', 'stabilityFeeUpdatedAt', '0')

      clearStore()
    })
    test('does not create it', () => {
      let event = createEvent('c2')

      handleDrip(event)

      assert.notInStore('CollateralType', 'c2')

      clearStore()
    })
  })
})
