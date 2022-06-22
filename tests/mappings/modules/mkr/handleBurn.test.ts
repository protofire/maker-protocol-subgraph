import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { clearStore, describe, test, assert, beforeEach, afterEach } from 'matchstick-as'
import { SystemState, User } from '../../../../generated/schema'
import { Burn as BurnEvent } from '../../../../generated/Token/DSToken'
import { users } from '../../../../src/entities'
import { handleBurn } from '../../../../src/mappings/modules/mkr/dsToken'
import { tests } from '../../../../src/mappings/modules/tests'
import { mockDebt } from '../../../helpers/mockedFunctions'

function createEvent(guy: Address, wad: BigInt): BurnEvent {
  return changetype<BurnEvent>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getAddress('guy', guy),
      tests.helpers.params.getBigInt('wad', wad),
    ]),
  )
}

let userAddress: Address
let user: User
let systemState: SystemState

describe('Mkr#handleBurn', () => {
  afterEach(() => {
    clearStore()
  })

  beforeEach(() => {
    mockDebt()

    systemState = new SystemState('current')
    systemState.totalMkr = BigDecimal.fromString('2500')
    systemState.save()

    userAddress = Address.fromString('0x60b86af869f23aeb552fb7f3cabd11b829f6ab2f')
    user = users.getOrCreateUser(userAddress)
    user.totalMkrBalance = BigDecimal.fromString('2500')
    user.save()
  })

  test("decreases user's totalMkrBalance by wad quantity", () => {
    let amount = BigInt.fromString('1000000000000000000000') // wad

    let event = createEvent(userAddress, amount)

    handleBurn(event)

    assert.fieldEquals('User', userAddress.toHexString(), 'totalMkrBalance', '1500')
  })

  test("decreses system's totalMrk by wad quantity", () => {
    let amount = BigInt.fromString('1000000000000000000000') // wad

    let event = createEvent(userAddress, amount)

    handleBurn(event)

    assert.fieldEquals('SystemState', 'current', 'totalMkr', '1500')
  })
})
