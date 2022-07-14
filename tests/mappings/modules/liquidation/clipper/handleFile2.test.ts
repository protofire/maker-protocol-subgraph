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
    systemState.saleAuctionSpotterContract = prevAddress
    systemState.saleAuctionDogContract = prevAddress
    systemState.saleAuctionCalcContract = prevAddress
    systemState.saleAuctionVowContract = prevAddress
    systemState.save()
  })

  describe('when [what]=empty', () => {
    test('does not update anything', () => {
      let what = ''
      let data = Address.fromString('0x0000000000000000000000000000000000000001')

      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionSpotterContract', prevAddress.toHexString())
      assert.fieldEquals('SystemState', 'current', 'saleAuctionDogContract', prevAddress.toHexString())
      assert.fieldEquals('SystemState', 'current', 'saleAuctionCalcContract', prevAddress.toHexString())
      assert.fieldEquals('SystemState', 'current', 'saleAuctionVowContract', prevAddress.toHexString())
    })
  })

  describe('when [what]=spotter', () => {
    test('updates saleAuctionSpotterContract', () => {
      let what = 'spotter'
      let data = Address.fromString('0x0000000000000000000000000000000000000001')
      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionSpotterContract', data.toHexString())
    })
  })

  describe('when [what]=dog', () => {
    test('updates saleAuctionDogContract', () => {
      let what = 'dog'
      let data = Address.fromString('0x0000000000000000000000000000000000000001')
      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionDogContract', data.toHexString())
    })
  })

  describe('when [what]=vow', () => {
    test('updates saleAuctionVowContract', () => {
      let what = 'vow'
      let data = Address.fromString('0x0000000000000000000000000000000000000001')
      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionVowContract', data.toHexString())
    })
  })

  describe('when [what]=calc', () => {
    test('updates saleAuctionCalcContract', () => {
      let what = 'calc'
      let data = Address.fromString('0x0000000000000000000000000000000000000001')
      let event = createEvent(what, data)

      handleFile2(event)

      assert.fieldEquals('SystemState', 'current', 'saleAuctionCalcContract', data.toHexString())
    })
  })
})
