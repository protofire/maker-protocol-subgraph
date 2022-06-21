import { Bytes, BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { units } from '@protofire/subgraph-toolkit'
import { test, clearStore, assert, describe, beforeAll, afterAll } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Vow/Vow'
import { handleFile } from '../../../../../src/mappings/modules/system-stabilizer/vow'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'

let amount = '100500000000000000000000000000000000000000000000' // 100.5 (rad) 100500000000000000000000000000 (wad)
let address = '0xa4f79bc4a5612bdda35904fdf55fc4cb53d1bff6'

type TransformAmount = (n: BigInt) => BigDecimal

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

function checkUintHandleFile(what: string, field: string, transformAmount: TransformAmount): void {
  let sig = '0x29ae8114'
  let data = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(amount)).reverse())
  let event = createEvent(sig, what, data)

  handleFile(event)

  assert.fieldEquals('SystemState', 'current', field, transformAmount(BigInt.fromString(amount)).toString())
}

function checkAddressHandleFile(what: string, field: string, data: Address): void {
  let sig = '0xd4e8be83'
  let dataBytes = changetype<Bytes>(data)
  let event = createEvent(sig, what, dataBytes)

  handleFile(event)

  assert.fieldEquals('SystemState', 'current', field, data.toHexString())
}

function returnPlainAmount(amount: BigInt): BigDecimal {
  return amount.toBigDecimal()
}

describe('Vow#handleFile', () => {
  beforeAll(() => {
    mockDebt()
  })

  describe('For file(bytes32 what, uint256 data) with what=(wait,bump,sump,dump,hump)', () => {
    test('For what=wait.', () => {
      checkUintHandleFile('wait', 'debtAuctionDelay', returnPlainAmount)
    })

    test('For what=bump', () => {
      checkUintHandleFile('bump', 'surplusAuctionLotSize', units.fromRad)
    })

    test('For what=sump', () => {
      checkUintHandleFile('sump', 'debtAuctionBidSize', units.fromRad)
    })

    test('For what=dump', () => {
      checkUintHandleFile('dump', 'debtAuctionInitialLotSize', units.fromWad)
    })

    test('For what=hump', () => {
      checkUintHandleFile('hump', 'surplusAuctionBuffer', units.fromRad)
    })
  })

  describe('For file(bytes32 what, address data) with what=(flapper,flopper)', () => {
    test('For what=Flapper', () => {
      checkAddressHandleFile('flapper', 'vowFlapperContract', Address.fromString(address))
    })

    test('For what=Flopper', () => {
      checkAddressHandleFile('flopper', 'vowFlopperContract', Address.fromString(address))
    })
  })

  afterAll(() => {
    clearStore()
  })
})
