import { Bytes, Address, BigInt } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, describe } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flap/Flapper'
import { auctions, system as systemModule } from '../../../../../src/entities'
import { handleTend } from '../../../../../src/mappings/modules/system-stabilizer/flap'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'

describe('Flapper#handleTend', () => {
  test('updates the highestBidder, bidAmount and the endTimeAt', () => {
    let signature = '0x4712f803'

    let id = '50'
    let bid = '100000000000000000000'
    let defaultTTL = BigInt.fromString('500')

    let event = changetype<LogNote>(
      tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes('sig', Bytes.fromHexString(signature)),
        tests.helpers.params.getBytes('usr', Bytes.fromUTF8('')),
        tests.helpers.params.getBytes('arg1', changetype<Bytes>(Bytes.fromBigInt(BigInt.fromString(id)))),
        tests.helpers.params.getBytes('arg2', changetype<Bytes>(Bytes.fromBigInt(BigInt.fromString(bid)))),
      ]),
    )
    event.block.timestamp = BigInt.fromString('250')

    let auction = auctions.loadOrCreateSurplusAuction(id, event)
    auction.highestBidder = Address.fromString('0x4d95a049d5b0b7d32058cd3f2163015747522e99')
    auction.bidAmount = BigInt.fromString(bid)
    auction.save()

    mockDebt()
    let system = systemModule.getSystemState(event)
    system.surplusAuctionBidDuration = defaultTTL
    system.save()

    handleTend(event)

    assert.fieldEquals('SurplusAuction', auction.id, 'highestBidder', event.transaction.from.toHexString())
    assert.fieldEquals('SurplusAuction', auction.id, 'endTimeAt', event.block.timestamp.plus(defaultTTL).toString())
    assert.fieldEquals('SurplusAuction', auction.id, 'bidAmount', bid)

    clearStore()
  })
})
