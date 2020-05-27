import { BigInt } from '@graphprotocol/graph-ts'

export let ONE = BigInt.fromI32(1)
export let ZERO = BigInt.fromI32(0)

export function fromNumber(value: i32): BigInt {
  return BigInt.fromI32(value)
}

export function fromString(value: string): BigInt {
  return fromNumber(parseI32(value))
}
