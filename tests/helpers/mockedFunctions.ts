import { tests } from '../../src/mappings/modules/tests'
import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts'

export function mockSin(era: i32): void {
  let arg1 = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(era))
  let sinResult = BigInt.fromString('100').toI32()
  tests.helpers.contractCalls.mockFunction(
    Address.fromString('0xA950524441892A31ebddF91d3cEEFa04Bf454466'),
    'sin',
    'sin(uint256):(uint256)',
    [arg1],
    [ethereum.Value.fromI32(sinResult)],
  )
}

export function mockChi(): void {
  let chiResult = BigInt.fromString('10').toI32()
  tests.helpers.contractCalls.mockFunction(
    Address.fromString('0x197e90f9fad81970ba7976f33cbd77088e5d7cf7'),
    'chi',
    'chi():(uint256)',
    [],
    [ethereum.Value.fromI32(chiResult)],
  )
}
