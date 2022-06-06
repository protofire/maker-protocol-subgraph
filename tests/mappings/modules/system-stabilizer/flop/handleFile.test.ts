import { Bytes, Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { units, bytes } from '@protofire/subgraph-toolkit'
import { test, clearStore, assert, log, describe } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flop/Flopper'
import { handleFile } from '../../../../../src/mappings/modules/system-stabilizer/flop'
import { mockDebt } from '../../../../helpers/mockedFunctions'
import { tests } from '../../../../../src/mappings/modules/tests'
import { Auctions, system as systemModule } from '../../../../../src/entities'

function createEvent(what: string, data: string): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x1a0b287e'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let dataBytes = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(data)).reverse())
  let arg2 = tests.helpers.params.getBytes('arg2', Bytes.fromUTF8(what))
  let arg3 = tests.helpers.params.getBytes('arg3', dataBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2, arg3]))

  return event
}

describe('Flopper#handleFile', () => {
  describe("When [what] is 'beg'", () => {
    test('Updates SystemState.debtAuctionMinimumBidIncrease', () => {
      let what = 'beg'
      let data = '100000000000000000000' // 100 wad

      let event = createEvent(what, data)

      mockDebt()

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'debtAuctionMinimumBidIncrease', '100')

      clearStore()
    })
  })

  describe("When [what] is 'pad'", () => {
    test('Updates SystemState.debtAuctionMinimumBidIncrease', () => {
      let what = 'pad'
      let data = '100000000000000000000' // 100 wad

      let event = createEvent(what, data)

      mockDebt()

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'debtAuctionLotSizeIncrease', '100')

      clearStore()
    })
  })

  describe("When [what] is 'ttl'", () => {
    test('Updates SystemState.debtAuctionBidDuration', () => {
      let what = 'ttl'
      let data = '60' // 60 seconds

      let event = createEvent(what, data)

      mockDebt()

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'debtAuctionBidDuration', '60')

      clearStore()
    })
  })

  describe("When [what] is 'tau'", () => {
    test('Updates SystemState.debtAuctionDuration', () => {
      let what = 'tau'
      let data = '60' // 60 seconds
      // https://docs.soliditylang.org/en/v0.8.14/units-and-global-variables.html
      // SM: uint48   public   ttl = 3 hours;

      let event = createEvent(what, data)

      mockDebt()

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'debtAuctionDuration', '60')

      clearStore()
    })
  })
})
