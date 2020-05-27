import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

const ADDRESS_LENGTH = 20

export function toAddress(address: Bytes): Address {
  return Address.fromHexString(address.toHex()).subarray(-ADDRESS_LENGTH) as Address
}

export function toSignedInt(value: Bytes, signed: boolean = false, bigEndian: boolean = true): BigInt {
  return BigInt.fromSignedBytes(bigEndian ? (value.reverse() as Bytes) : value)
}

export function toUnsignedInt(value: Bytes, bigEndian: boolean = true): BigInt {
  return BigInt.fromUnsignedBytes(bigEndian ? (value.reverse() as Bytes) : value)
}
