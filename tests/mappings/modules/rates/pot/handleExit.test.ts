import { Bytes, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { describe, test, assert, clearStore, beforeAll } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Pot/Pot'
import { handleExit } from '../../../../../src/mappings/modules/rates/pot'
import { tests } from '../../../../../src/mappings/modules/tests'
import { users } from '../../../../../src/entities/users'
import { system as systemModule } from '../../../../../src/entities/system'

var defaultAmount: string

describe('Pot#handleExit', () => {
  beforeAll(() => {
    defaultAmount = '100500000000000000000' // 100.5
  })

  test('Substracts the amount of the user#savings', () => {
    let sig = '0x7f8661a1'
    let wad = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(defaultAmount)).reverse())
    let event = changetype<LogNote>(
      tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes('sig', Bytes.fromHexString(sig)),
        tests.helpers.params.getBytes('usr', Bytes.fromUTF8('')),
        tests.helpers.params.getBytes('arg1', wad),
      ]),
    )

    let initAmount = BigDecimal.fromString('201')
    let user = users.getOrCreateUser(event.transaction.from)
    user.savings = initAmount
    user.save()
    let system = systemModule.getSystemState(event)
    system.totalSavingsInPot = initAmount
    system.save()

    handleExit(event)

    assert.fieldEquals('User', event.transaction.from.toHexString(), 'savings', '100.5')
    assert.fieldEquals('SystemState', 'current', 'totalSavingsInPot', '100.5')
    clearStore()
  })
})
