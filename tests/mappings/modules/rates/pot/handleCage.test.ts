import { Bytes } from '@graphprotocol/graph-ts'
import { units, bytes } from '@protofire/subgraph-toolkit'
import { test, clearStore, assert, log, describe, beforeEach } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Pot/Pot'
import { handleCage } from '../../../../../src/mappings/modules/rates/pot'
import { mockDebt } from '../../../../helpers/mockedFunctions'
import { tests } from '../../../../../src/mappings/modules/tests'

function createEvent(): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x69245009'))
  let usr = tests.helpers.params.getBytes('arg1', Bytes.fromUTF8(''))

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, usr]))

  return event
}

describe('Pot#handleCage', () => {
  test('Updates SystemState.savingsRate, dsrLive & dsrLiveLastUpdateAt', () => {
    let event = createEvent()

    mockDebt()

    handleCage(event)

    assert.fieldEquals('SystemState', 'current', 'savingsRate', '1')
    assert.fieldEquals('SystemState', 'current', 'dsrLive', 'false')
    assert.fieldEquals('SystemState', 'current', 'dsrLiveLastUpdateAt', event.block.timestamp.toString())

    clearStore()
  })
})
