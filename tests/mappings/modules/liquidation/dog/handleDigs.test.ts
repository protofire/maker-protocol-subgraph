import { Bytes, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { describe, test, assert, clearStore, beforeAll, afterAll } from 'matchstick-as'
import { Digs } from '../../../../../generated/Dog/Dog'
import { handleDigs } from '../../../../../src/mappings/modules/liquidation/dog'
import { tests } from '../../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../../helpers/mockedFunctions'
import { CollateralType } from '../../../../../generated/schema'
import { system as systemModule } from '../../../../../src/entities'

function createEvent(): Digs {
    //let ilk = Bytes.fromHexString("4554482D41000000000000000000000000000000000000000000000000000000")
    let ilk = "ETH-A"
    let rad = BigInt.fromString("10000000000000000000000000000000000000000000000000")
    let event = changetype<Digs>(tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes("ilk", Bytes.fromUTF8(ilk)),
        tests.helpers.params.getBigInt("rad", rad),
    ]))

  return event
}

describe('Dog#handleDigs', () => {
  test('Updates systemState#totalAuctionDebtAndFees and updates CollateralType#dirt', () => {
    let event = createEvent()

    let collateralType = new CollateralType("ETH-A")
    collateralType.daiAmountToCoverDebtAndFees = BigDecimal.fromString('20000.0')
    collateralType.save()

    mockDebt()
    let systemState = systemModule.getSystemState(event)
    systemState.totalDaiAmountToCoverDebtAndFees = BigDecimal.fromString('20000.0')
    systemState.save()

    handleDigs(event)

    assert.fieldEquals('SystemState', 'current', 'totalDaiAmountToCoverDebtAndFees', '10000')
    assert.fieldEquals('CollateralType', 'ETH-A', 'daiAmountToCoverDebtAndFees', '10000')

    clearStore()
  })
})