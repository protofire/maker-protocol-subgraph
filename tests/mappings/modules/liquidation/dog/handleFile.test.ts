import { Address, Bytes, BigInt } from '@graphprotocol/graph-ts'
import { units } from '@protofire/subgraph-toolkit'
import { afterAll, beforeAll, clearStore, describe, test, assert } from 'matchstick-as'
import { File, File1, File2, File3 } from '../../../../../generated/Dog/Dog'
import {
  handleFileChop,
  handleFileClip,
  handleFileHole,
  handleFileVow,
} from '../../../../../src/mappings/modules/liquidation/dog'
import { tests } from '../../../../../src/mappings/modules/tests'

let ilk = 'test'
let address = '0x10994f7d520ef08dd877499fb1b052dbde3d4601'
let amount = '100500000000000000000000000000000000000000000000'
let radAmount = units.fromRad(BigInt.fromString(amount)).toString() // 100.5
let wadAmount = units.fromWad(BigInt.fromString(amount)).toString() // 100500000000000000000000000000

describe('Dog#handleFile', () => {
  describe('For event File1 and what = vow', () => {
    test('Updates the dog VowLike value', () => {
      let what = 'vow'
      let event = changetype<File1>(
        tests.helpers.events.getNewEvent([
          tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
          tests.helpers.params.getAddress('data', Address.fromString(address)),
        ]),
      )

      handleFileVow(event)

      assert.fieldEquals('SystemState', 'current', 'dogVowContract', address)
    })
  })

  describe('For event File and what = Hole', () => {
    test('Updates the Hole ', () => {
      let what = 'Hole'
      let event = changetype<File>(
        tests.helpers.events.getNewEvent([
          tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
          tests.helpers.params.getBigInt('data', BigInt.fromString(amount)),
        ]),
      )

      handleFileHole(event)

      assert.fieldEquals('SystemState', 'current', 'maxDaiToCoverAuction', radAmount)
    })
  })

  describe('For event File2 and what = (chop,hole)', () => {
    test('Sets what=chop and updates the CollateralType#chop', () => {
      let what = 'chop'
      let event = changetype<File2>(
        tests.helpers.events.getNewEvent([
          tests.helpers.params.getBytes('ilk', Bytes.fromUTF8(ilk)),
          tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
          tests.helpers.params.getBigInt('data', BigInt.fromString(amount)),
        ]),
      )

      handleFileChop(event)

      assert.fieldEquals('CollateralType', ilk, 'liquidationPenalty', wadAmount)
    })

    test('Sets what=hole and updates the CollateralType#hole', () => {
      let what = 'hole'
      let event = changetype<File2>(
        tests.helpers.events.getNewEvent([
          tests.helpers.params.getBytes('ilk', Bytes.fromUTF8(ilk)),
          tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
          tests.helpers.params.getBigInt('data', BigInt.fromString(amount)),
        ]),
      )

      handleFileChop(event)

      assert.fieldEquals('CollateralType', ilk, 'maxDaiToCoverAuction', radAmount)
    })
  })

  describe('For event File3 and what = clip', () => {
    test('Updates the CollateralType#clip', () => {
      let what = 'clip'
      let event = changetype<File3>(
        tests.helpers.events.getNewEvent([
          tests.helpers.params.getBytes('ilk', Bytes.fromUTF8(ilk)),
          tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
          tests.helpers.params.getAddress('clip', Address.fromString(address)),
        ]),
      )

      handleFileClip(event)

      assert.fieldEquals('CollateralType', ilk, 'liquidatorAddress', address)
    })
  })

  afterAll(() => {
    clearStore()
  })
})
