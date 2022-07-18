import { Bytes, BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { describe, test, assert, clearStore } from 'matchstick-as'
import { Bark } from '../../../../../generated/Dog/Dog'
import { handleBark } from '../../../../../src/mappings/modules/liquidation/dog'
import { tests } from '../../../../../src/mappings/modules/tests'
import { CollateralType } from '../../../../../generated/schema'
import { system as systemModule } from '../../../../../src/entities'

describe('Dog#handleBark', () => {
  test('Creates a SaleAuction entity and adds to the SystemState#totalDaiAmountToCoverDebtAndFees and CollateralType#daiAmountToCoverDebtAndFees field', () => {
    let ilk = 'ETH-A'
    let urn = '0x10994f7d520ef08dd877499fb1b052dbde3d4601'
    let ink = BigInt.fromString('5000000000000000000000000000000000000000000000') // 5 rad
    let art = BigInt.fromString('5000000000000000000000000000000000000000000000') // 5 rad
    let due = BigInt.fromString('5000000000000000000') // 5 wad
    let clip = '0x10994f7d520ef08dd877499fb1b052dbde3d4602'
    let id = BigInt.fromString('2')

    let event = changetype<Bark>(
      tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes('ilk', Bytes.fromUTF8(ilk)),
        tests.helpers.params.getAddress('urn', Address.fromString(urn)),
        tests.helpers.params.getBigInt('ink', ink),
        tests.helpers.params.getBigInt('art', art),
        tests.helpers.params.getBigInt('due', due),
        tests.helpers.params.getAddress('clip', Address.fromString(clip)),
        tests.helpers.params.getBigInt('id', id),
      ]),
    )

    event.block.timestamp = BigInt.fromI32(1001)

    let collateralType = new CollateralType(ilk)
    collateralType.daiAmountToCoverDebtAndFees = BigDecimal.fromString('100.0')
    collateralType.liquidationPenalty = BigDecimal.fromString('20.0')
    collateralType.save()

    let systemState = systemModule.getSystemState(event)
    systemState.totalDaiAmountToCoverDebtAndFees = BigDecimal.fromString('500.0')
    systemState.save()

    handleBark(event)

    assert.fieldEquals('SystemState', 'current', 'totalDaiAmountToCoverDebtAndFees', '600')

    assert.fieldEquals('SaleAuction', id.toString(), 'vault', urn + '-' + ilk.toString())
    assert.fieldEquals('SaleAuction', id.toString(), 'collateralType', ilk.toString())

    assert.fieldEquals('CollateralType', ilk, 'daiAmountToCoverDebtAndFees', '200')

    clearStore()
  })
})
