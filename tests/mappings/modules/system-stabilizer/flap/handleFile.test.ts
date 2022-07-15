import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { test, clearStore, describe, assert } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flap/Flapper'
import { handleFile } from '../../../../../src/mappings/modules/system-stabilizer/flap'
import { tests } from '../../../../../src/mappings/modules/tests'

function createEvent(what: string, data: string): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x1a0b287e'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))
  let dataBytes = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(data)).reverse())
  let arg2 = tests.helpers.params.getBytes('arg2', Bytes.fromUTF8(what))
  let arg3 = tests.helpers.params.getBytes('arg3', dataBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2, arg3]))

  return event
}

describe('Flapper#handleFile', () => {
  describe("When [what] is 'beg'", () => {
    test('Updates SystemState.surplusAuctionMinimumBidIncrease', () => {
      let what = 'beg'
      let data = '100000000000000000000' // 100 wad

      let event = createEvent(what, data)

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'surplusAuctionMinimumBidIncrease', '100')

      clearStore()
    })
  })

  describe("When [what] is 'ttl'", () => {
    test('Updates SystemState.surplusAuctionBidDuration', () => {
      let what = 'ttl'
      let data = '60'

      let event = createEvent(what, data)

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'surplusAuctionBidDuration', '60')

      clearStore()
    })
  })

  describe("When [what] is 'tau'", () => {
    test('Updates SystemState.surplusAuctionDuration', () => {
      let what = 'tau'
      let data = '120'

      let event = createEvent(what, data)

      handleFile(event)

      assert.fieldEquals('SystemState', 'current', 'surplusAuctionDuration', '120')

      clearStore()
    })
  })
})
