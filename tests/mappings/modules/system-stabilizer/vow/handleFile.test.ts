import { Bytes, BigInt, Address } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, describe, beforeAll, afterAll, beforeEach } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Vow/Vow'
import { handleFile } from '../../../../../src/mappings/modules/system-stabilizer/vow'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'
import { system as systemModule } from '../../../../../src/entities'

let signature: string

function createEvent(sig: string, what: string, data: Bytes): LogNote {
  return changetype<LogNote>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getBytes('sig', Bytes.fromHexString(sig)),
      tests.helpers.params.getBytes('usr', Bytes.fromUTF8('')),
      tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(what)),
      tests.helpers.params.getBytes('arg2', data),
    ]),
  )
}

function checkSameAddressHandleFile(what: string, field: string, data: String): void {
  let sig = '0xd4e8be83'
  let dataBytes = changetype<Bytes>(data)
  let event = createEvent(sig, what, dataBytes)

  //vowFlopperContract must be the same as before handleFile
  let system = systemModule.getSystemState(event)
  let vowAddress = system.vowFlopperContract.toHexString()
  handleFile(event)

  assert.fieldEquals('SystemState', 'current', 'vowFlopperContract', vowAddress)
}

describe('Vow#handleFile', () => {
  beforeAll(() => {
    mockDebt()
  })

  afterAll(() => {
    clearStore()
  })

  describe('when [signature]=0x29ae8114', () => {
    beforeEach(() => {
      signature = '0x29ae8114'
    })

    describe('when [what]=wait.', () => {
      test('updates SystemState.debtAuctionDelay', () => {
        let value = BigInt.fromString('3500')
        let data = Bytes.fromUint8Array(Bytes.fromBigInt(value).reverse())
        let event = createEvent(signature, 'wait', data)

        handleFile(event)

        assert.fieldEquals('SystemState', 'current', 'debtAuctionDelay', value.toString())
      })
    })

    describe('when [what]=bump', () => {
      test('updates SystemState.surplusAuctionLotSize', () => {
        let value = BigInt.fromString('100500000000000000000000000000000000000000000000')
        let data = Bytes.fromUint8Array(Bytes.fromBigInt(value).reverse())
        let event = createEvent(signature, 'bump', data)

        handleFile(event)

        assert.fieldEquals('SystemState', 'current', 'surplusAuctionLotSize', '100.5')
      })
    })

    describe('when [what]=sump', () => {
      test('updates SystemState.debtAuctionBidSize', () => {
        let value = BigInt.fromString('100500000000000000000000000000000000000000000000')
        let data = Bytes.fromUint8Array(Bytes.fromBigInt(value).reverse())
        let event = createEvent(signature, 'sump', data)

        handleFile(event)

        assert.fieldEquals('SystemState', 'current', 'debtAuctionBidSize', '100.5')
      })
    })

    describe('when [what]=dump', () => {
      test('updates SystemState.debtAuctionInitialLotSize', () => {
        let value = BigInt.fromString('100700000000000000000') // 100.7 wad
        let data = Bytes.fromUint8Array(Bytes.fromBigInt(value).reverse())
        let event = createEvent(signature, 'dump', data)

        handleFile(event)

        assert.fieldEquals('SystemState', 'current', 'debtAuctionInitialLotSize', '100.7')
      })
    })

    describe('when [what]=hump', () => {
      test('updates SystemState.surplusAuctionBuffer', () => {
        let value = BigInt.fromString('100500000000000000000000000000000000000000000000')
        let data = Bytes.fromUint8Array(Bytes.fromBigInt(value).reverse())
        let event = createEvent(signature, 'hump', data)

        handleFile(event)

        assert.fieldEquals('SystemState', 'current', 'surplusAuctionBuffer', '100.5')
      })
    })
  })

  describe('when [signature]=0xd4e8be83', () => {
    beforeEach(() => {
      signature = '0xd4e8be83'
    })

    describe('when [what]=flapper', () => {
      test('updates SystemState.vowFlapperContract', () => {
        let address = Address.fromHexString('0xa4f79bc4a5612bdda35904fdf55fc4cb53d1bff6')
        let dataBytes = changetype<Bytes>(address)
        let event = createEvent(signature, 'flapper', dataBytes)

        handleFile(event)

        assert.fieldEquals('SystemState', 'current', 'vowFlapperContract', address.toHexString())
      })
    })

    test('For what=(empty) and a 64bytes String in Adress ', () => {
      let bigAddress = '0000000000000000000000004d95a049d5b0b7d32058cd3f2163015747522e99'
      checkSameAddressHandleFile('', 'vowFlopperContract', bigAddress)
    })
  })

  describe('when [what]=flopper', () => {
    test('updates SystemState.vowFlopperContract', () => {
      let address = Address.fromHexString('0xa4f79bc4a5612bdda35904fdf55fc4cb53d1bff6')
      let dataBytes = changetype<Bytes>(address)
      let event = createEvent(signature, 'flopper', dataBytes)

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'vowFlopperContract', address.toHexString())
    })
  })
})
