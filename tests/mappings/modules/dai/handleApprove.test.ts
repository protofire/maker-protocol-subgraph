import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, log, describe, beforeEach } from 'matchstick-as'
import { mockDebt } from '../../../helpers/mockedFunctions'
import { handleApproval } from '../../../../src/mappings/modules/dai/dai'
import { tests } from '../../../../src/mappings/modules/tests'
import { system as systemModule, users } from '../../../../src/entities'
import { Approval } from '../../../../generated/Dai/Dai'

//(address indexed src, address indexed guy, uint wad);
function createEvent(src: Address, guy: Address, wad: BigInt): Approval {
  return changetype<Approval>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getAddress('src', src),
      tests.helpers.params.getAddress('guy', guy),
      tests.helpers.params.getBigInt('wad', wad),
    ]),
  )
}

function createEntities(event: Approval, src: Address, guy: Address): void {
  let userSrc = users.getOrCreateUser(src)
  userSrc.save()

  let userDst = users.getOrCreateUser(guy)
  userDst.save()
}

describe('ERC.20-Dai#handleApproval', () => {
  beforeEach(() => {
    mockDebt()
  })
  test('Create DaiApproval', () => {
    let srcStr = '0x0000000000000000000000000000000111111111'
    let dstStr = '0x1111100000000000000000000000000000000000'
    let src = Address.fromString(srcStr)
    let guy = Address.fromString(dstStr)
    let wad = BigInt.fromString('100000000000000000000') // 100 wad

    let event = createEvent(src, guy, wad)
    let idApproval = event.params.src.toHexString() + '-' + event.params.guy.toHexString()

    createEntities(event, src, guy)

    handleApproval(event)

    assert.fieldEquals('DaiApproval', idApproval, 'owner', srcStr)
    assert.fieldEquals('DaiApproval', idApproval, 'spender', dstStr)
    assert.fieldEquals('DaiApproval', idApproval, 'value', '100')

    clearStore()
  })
})
