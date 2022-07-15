import { BigDecimal } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Vow/Vow'
import { handleFlap } from '../../../../../src/mappings/modules/system-stabilizer/vow'
import { tests } from '../../../../../src/mappings/modules/tests'
import { system as systemModule } from '../../../../../src/entities'

test('Vow#handleFlap: Creates the entity VowFlapLog', () => {
  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([]))

  let system = systemModule.getSystemState(event)
  system.surplusAuctionLotSize = BigDecimal.fromString('1.5')
  system.save()
  handleFlap(event)

  assert.fieldEquals('VowFlapLog', event.transaction.hash.toHexString(), 'surplusAuctionLotSize', '1.5')
  clearStore()
})
