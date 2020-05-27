import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export let ONE = BigDecimal.fromString('1')
export let ZERO = BigDecimal.fromString('0')

let WAD_PRECISION = <u8>18
let RAY_PRECISION = <u8>27
let RAD_PRECISION = <u8>45

let WAD = BigInt.fromI32(10)
  .pow(WAD_PRECISION)
  .toBigDecimal()

let RAY = BigInt.fromI32(10)
  .pow(RAY_PRECISION)
  .toBigDecimal()

let RAD = BigInt.fromI32(10)
  .pow(RAD_PRECISION)
  .toBigDecimal()

// TODO
// let SECONDS_IN_YEAR = <u8>(60 * 60 * 24 * 365)
//
// let RAY_APY = BigInt.fromI32(10)
//   .pow(RAY_PRECISION * SECONDS_IN_YEAR)
//   .toBigDecimal()

export function fromRad(value: BigInt): BigDecimal {
  return value.divDecimal(RAD)
}

export function fromRay(value: BigInt): BigDecimal {
  return value.divDecimal(RAY)
}

// TODO
// export function fromRayApy(value: BigInt): BigDecimal {
//   return value
//     .pow(SECONDS_IN_YEAR)
//     .divDecimal(RAY_APY)
//     .minus(ONE)
// }

export function fromWad(value: BigInt): BigDecimal {
  return value.divDecimal(WAD)
}

export function toRad(value: BigDecimal): BigInt {
  return value.times(RAD).truncate(0).digits
}

export function toRay(value: BigDecimal): BigInt {
  return value.times(RAY).truncate(0).digits
}

export function toWad(value: BigDecimal): BigInt {
  return value.times(WAD).truncate(0).digits
}
