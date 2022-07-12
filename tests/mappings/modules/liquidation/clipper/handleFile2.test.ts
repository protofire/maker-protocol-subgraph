import { test, assert, clearStore, describe, beforeAll, beforeEach } from 'matchstick-as'
import { tests } from '../../../../../src/mappings/modules/tests'
import { File1 as FileAddressEvent } from '../../../../../generated/Clipper/Clipper'
import { handleFile2 } from '../../../../../src/mappings/modules/liquidation/clipper'
import { Address, Bytes } from '@graphprotocol/graph-ts'
import { SystemState } from '../../../../../generated/schema'
import { mockDebt } from '../../../../helpers/mockedFunctions'

function createEvent(what: string, data: Address): FileAddressEvent {
  return changetype<FileAddressEvent>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getBytes('what', Bytes.fromUTF8(what)),
      tests.helpers.params.getAddress('data', data),
    ]),
  )
}

let prevAddress = Address.fromString('0x0000000000000000000000000000000000000000')
let systemState: SystemState

describe('Clipper#handleFile2', () => {
  beforeAll(() => {
    clearStore()
  })

  beforeEach(() => {
    mockDebt()

    systemState = new SystemState('current')
    systemState.clipperSpotterContract = prevAddress
    systemState.clipperDogContract = prevAddress
    systemState.clipperCalcContract = prevAddress
    systemState.clipperVowContract = prevAddress
    systemState.save()
  })

  describe('when [what]=empty', () => {
    test('does not update anything', () => {
      let what = ''
      let data = Address.fromString('0x0000000000000000000000000000000000000001')

      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'clipperSpotterContract', prevAddress.toHexString())
      assert.fieldEquals('SystemState', 'current', 'clipperDogContract', prevAddress.toHexString())
      assert.fieldEquals('SystemState', 'current', 'clipperCalcContract', prevAddress.toHexString())
      assert.fieldEquals('SystemState', 'current', 'clipperVowContract', prevAddress.toHexString())
    })
  })

  describe('when [what]=spotter', () => {
    test('updates clipperSpotterContract', () => {
      let what = 'spotter'
      let data = Address.fromString('0x0000000000000000000000000000000000000001')
      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'clipperSpotterContract', data.toHexString())
    })
  })

  describe('when [what]=dog', () => {
    test('updates clipperDogContract', () => {
      let what = 'dog'
      let data = Address.fromString('0x0000000000000000000000000000000000000001')
      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'clipperDogContract', data.toHexString())
    })
  })

  describe('when [what]=vow', () => {
    test('updates clipperVowContract', () => {
      let what = 'vow'
      let data = Address.fromString('0x0000000000000000000000000000000000000001')
      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'clipperVowContract', data.toHexString())
    })
  })

  describe('when [what]=calc', () => {
    test('updates clipperCalcContract', () => {
      let what = 'calc'
      let data = Address.fromString('0x0000000000000000000000000000000000000001')
      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'clipperCalcContract', data.toHexString())
    })
  })
})
