import { Bytes, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as'
import { User } from '../../../../../generated/schema'
import { LogNote } from '../../../../../generated/Vat/Vat'
import { handleSuck } from '../../../../../src/mappings/modules/core/vat'
import { tests } from '../../../../../src/mappings/modules/tests'

function createEvent(u: string, v: string, rad: string): LogNote {
  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString('0x1a0b287e'))
  let arg1 = tests.helpers.params.getBytes('arg1', Bytes.fromHexString(u))
  let arg2 = tests.helpers.params.getBytes('arg2', Bytes.fromHexString(v))
  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(rad)).reverse())
  let arg3 = tests.helpers.params.getBytes('arg3', radBytes)

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2, arg3]))

  return event
}

test('Vat#handleSuck', () => {
  let u = '0xae063a1874388ebcac879127bd43cdaeb8a0fc2c'
  let v = '0x166ee591c118976d934d4c63481a707114c90e56'
  let rad = '100500000000000000000000000000000000000000000000'
  let event = createEvent(u, v, rad)

  let user1 = new User(u)
  user1.save()
  let user2 = new User(v)
  user2.totalVaultDai = BigDecimal.fromString('1000')
  user2.save()

  handleSuck(event)

  assert.fieldEquals('User', v, 'totalVaultDai', '1100.5')
  assert.fieldEquals('SystemDebt', u, 'amount', '100.5')

  assert.fieldEquals('SystemState', 'current', 'totalDebt', '100.5')
  assert.fieldEquals('SystemState', 'current', 'totalSystemDebt', '100.5')
  assert.fieldEquals('SystemState', 'current', 'dsrLiveUpdatedAt', event.block.timestamp.toString())

  clearStore()
})
