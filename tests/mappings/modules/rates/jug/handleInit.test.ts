import { test, clearStore, describe, beforeEach, assert } from 'matchstick-as'
import { handleInit } from '../../../../../src/mappings/modules/rates/jug'
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

describe('Jug#handleInit', () => {
  beforeEach(() => {
    let collateralType = collateralTypes.loadOrCreateCollateralType('c1')
    collateralType.save()
  })
  describe('when collateralType exist', () => {
    test('initiates CollateralType.stabilityFee to 1', () => {
      let event = createEvent('c1')

      handleInit(event)

      assert.fieldEquals('CollateralType', 'c1', 'stabilityFee', '1')

      clearStore()
    })
  })
  describe('when collateralType does not exist', () => {
    test('does nothing', () => {
      let event = createEvent('c2')

      handleInit(event)

      assert.fieldEquals('CollateralType', 'c1', 'stabilityFee', '0')

      clearStore()
    })
  })
})
