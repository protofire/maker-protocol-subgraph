import { Bytes, BigInt, Address } from '@graphprotocol/graph-ts'
import { test, clearStore, assert } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Vat/Vat'
import { handleMove } from '../../../../../src/mappings/modules/core/vat'
import { tests } from '../../../../../src/mappings/modules/tests'

function strRadToBytes(value: string): Bytes {
  return Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(value)).reverse())
}

test('Vat#handleMove moves dai from src to dst if users do not exist and amount is zero', () => {
  let signature = '0xbb35783b'
  let src = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'
  let dst = '0x9759a6ac90977b93b58547b4a71c78317f391a28'
  let amount = '100500000000000000000000000000000000000000000000'

  let sig = tests.helpers.params.getBytes('sig', Bytes.fromHexString(signature))
  let arg1 = tests.helpers.params.getBytes('arg1', Address.fromString(src))
  let arg2 = tests.helpers.params.getBytes('arg2', Address.fromString(dst))
  let arg3 = tests.helpers.params.getBytes('arg3', strRadToBytes(amount))

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([sig, arg1, arg2, arg3]))

  handleMove(event)

  assert.fieldEquals('User', src, 'totalVaultDai', '-100.5')
  assert.fieldEquals('User', dst, 'totalVaultDai', '100.5')

  clearStore()
})
