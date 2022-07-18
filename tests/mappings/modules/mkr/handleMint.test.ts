import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { clearStore, describe, test, assert, beforeEach, afterEach } from 'matchstick-as'
import { SystemState, User } from '../../../../generated/schema'
import { Mint as MintEvent } from '../../../../generated/DSToken/DSToken'
import { users } from '../../../../src/entities'
import { handleMint } from '../../../../src/mappings/modules/mkr/dsToken'
import { tests } from '../../../../src/mappings/modules/tests'

function createEvent(guy: Address, wad: BigInt): MintEvent {
  return changetype<MintEvent>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getAddress('guy', guy),
      tests.helpers.params.getBigInt('wad', wad),
    ]),
  )
}

let userAddress: Address
let user: User
let systemState: SystemState

describe('Mkr#handleMint', () => {
  afterEach(() => {
    clearStore()
  })

  beforeEach(() => {
    systemState = new SystemState('current')
    systemState.totalMkr = BigDecimal.fromString('2500')
    systemState.save()

    userAddress = Address.fromString('0x60b86af869f23aeb552fb7f3cabd11b829f6ab2f')
    user = users.getOrCreateUser(userAddress)
    user.totalMkrBalance = BigDecimal.fromString('2500')
    user.save()
  })

  test("increases user's totalMkrBalance by wad quantity", () => {
    let amount = BigInt.fromString('1000000000000000000000') // wad

    let event = createEvent(userAddress, amount)

    handleMint(event)

    assert.fieldEquals('User', userAddress.toHexString(), 'totalMkrBalance', '3500')
  })

  test("increases system's totalMrk by wad quantity", () => {
    let amount = BigInt.fromString('1000000000000000000000') // wad

    let event = createEvent(userAddress, amount)

    handleMint(event)

    assert.fieldEquals('SystemState', 'current', 'totalMkr', '3500')
  })
})
