import { tests } from '../../src/mappings/modules/tests'
import { Address, ethereum, BigInt, Value, Bytes, ByteArray } from '@graphprotocol/graph-ts'

export function mockDebt(): void {
  let debtResult = BigInt.fromString('100').toI32()
  tests.helpers.contractCalls.mockFunction(
    Address.fromString('0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'),
    'debt',
    'debt():(uint256)',
    [],
    [ethereum.Value.fromI32(debtResult)],
  )
}

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

export function mockDirt(): void {
  let dirtResult = BigInt.fromString('10000000000000000000000000000000000000000000000000')
  tests.helpers.contractCalls.mockFunction(
    Address.fromString('0x135954d155898D42C90D2a57824C690e0c7BEf1B'),
    'Dirt',
    'Dirt():(uint256)',
    [],
    [ethereum.Value.fromUnsignedBigInt(dirtResult)],
  )
}

export function mockIlks(ilk: string): void {
  let arg1 = ethereum.Value.fromFixedBytes(Bytes.fromUTF8(ilk))
  let ilkDirtResult = BigInt.fromString('10000000000000000000000000000000000000000000000000')
  let result1 = Address.fromString('0x000000000000000000000000000000000000aaaa')
  let result2 = BigInt.fromString('100').toI32()
  let result3 = BigInt.fromString('100').toI32()
  tests.helpers.contractCalls.mockFunction(
    Address.fromString('0x135954d155898D42C90D2a57824C690e0c7BEf1B'),
    'ilks',
    'ilks(bytes32):(address,uint256,uint256,uint256)',
    [arg1],
    [
      ethereum.Value.fromAddress(result1),
      ethereum.Value.fromI32(result2),
      ethereum.Value.fromI32(result3),
      ethereum.Value.fromUnsignedBigInt(ilkDirtResult),
    ],
  )
}
