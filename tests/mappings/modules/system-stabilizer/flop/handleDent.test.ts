import { Bytes, Address, BigInt } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, describe } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flop/Flopper'
import { auctions, system as systemModule } from '../../../../../src/entities'
import { handleDent } from '../../../../../src/mappings/modules/system-stabilizer/flop'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'

describe('Flopper#handleDent', () => {
  test('updates the highestBidder, quantity and endTime', () => {
    let signature = '0x5ff3a382'

    let id = '50'
    let lot = '100000000000000000000'
    let defaultTTL = BigInt.fromString('500')

    let event = changetype<LogNote>(
      tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes('sig', Bytes.fromHexString(signature)),
        tests.helpers.params.getBytes('usr', Bytes.fromUTF8('')),
        tests.helpers.params.getBytes('arg1', changetype<Bytes>(Bytes.fromBigInt(BigInt.fromString(id)))),
        tests.helpers.params.getBytes('arg2', changetype<Bytes>(Bytes.fromBigInt(BigInt.fromString(lot)))),
      ]),
    )
    event.block.timestamp = BigInt.fromString('250')

    let auction = auctions.loadOrCreateDebtAuction(id, event)
    auction.highestBidder = Address.fromString('0x4d95a049d5b0b7d32058cd3f2163015747522e99')
    auction.quantity = BigInt.fromString('15')
    auction.save()

    mockDebt()
    let system = systemModule.getSystemState(event)
    system.debtAuctionBidDuration = defaultTTL
    system.save()

    handleDent(event)

    assert.fieldEquals('DebtAuction', auction.id, 'highestBidder', event.transaction.from.toHexString())
    assert.fieldEquals('DebtAuction', auction.id, 'quantity', lot)
    assert.fieldEquals('DebtAuction', auction.id, 'endTime', event.block.timestamp.plus(defaultTTL).toString())

    clearStore()
  })
})
