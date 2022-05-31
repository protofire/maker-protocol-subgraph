import { Bytes, Address } from '@graphprotocol/graph-ts'
import { test, clearStore, assert } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flop/Flopper'
import { handleCage } from '../../../../../src/mappings/modules/system-stabilizer/flop'
import { tests } from '../../../../../src/mappings/modules/tests'

test('Flopper#handleCage creates a new LiveChangeLog event', () => {
  let signature = '0x69245009'
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString(signature))

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig]))

  let UPDATED_ADDRESS = '0x4d95a049d5b0b7d32058cd3f2163015747522e99'
  let address = Address.fromString(UPDATED_ADDRESS)
  let addressString = address.toHexString()
  event.address = address

  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0'

  handleCage(event)

  assert.fieldEquals('LiveChangeLog', id, 'contract', addressString)

  clearStore()
})
