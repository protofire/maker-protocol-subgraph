import { Address, Bytes, BigInt } from '@graphprotocol/graph-ts'
import { units } from '@protofire/subgraph-toolkit'
import { afterAll, beforeAll, clearStore, describe, test, assert } from 'matchstick-as'
import { File } from '../../../../../generated/StairstepExponentialDecrease/StairstepExponentialDecrease'
import { handleFile } from '../../../../../src/mappings/modules/liquidation/abacus'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'

describe('Abacus#handleFile', () => {
  beforeAll(() => {
    mockDebt()
  })

  describe('When [what] = cut', () => {
    test('Updates secondsBetweenPriceDrops in SystemState', () => {
      let what = 'cut'
      let data = '11' // 11 seconds

      let event = changetype<File>(
        tests.helpers.events.getNewEvent([
          tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
          tests.helpers.params.getBigInt('data', BigInt.fromString(data)),
        ]),
      )

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'secondsBetweenPriceDrops', '11')
    })
  })

  describe('When [what] = step', () => {
    test('Updates secondsBetweenPriceDrops in SystemState', () => {
      let what = 'step'
      let data = '11000000000000000000000000000' // 11 ray

      let event = changetype<File>(
        tests.helpers.events.getNewEvent([
          tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
          tests.helpers.params.getBigInt('data', BigInt.fromString(data)),
        ]),
      )

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'multiplicatorFactorPerStep', '11')
    })
  })

  afterAll(() => {
    clearStore()
  })
})
