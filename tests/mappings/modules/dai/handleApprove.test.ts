import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, log, describe, beforeEach } from 'matchstick-as'
import { handleApproval } from '../../../../src/mappings/modules/dai/dai'
import { tests } from '../../../../src/mappings/modules/tests'
import { system as systemModule, users, daiApprovals } from '../../../../src/entities'
import { Approval as ApprovalEvent } from '../../../../generated/Dai/Dai'

//(address indexed src, address indexed guy, uint wad);
function createEvent(src: Address, guy: Address, wad: BigInt): ApprovalEvent {
  return changetype<ApprovalEvent>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getAddress('src', src),
      tests.helpers.params.getAddress('guy', guy),
      tests.helpers.params.getBigInt('wad', wad),
    ]),
  )
}

function createEntities(event: ApprovalEvent, src: Address, guy: Address): void {
  let userSrc = users.getOrCreateUser(src)
  userSrc.save()

  let userDst = users.getOrCreateUser(guy)
  userDst.save()
}

function createApproval(event: ApprovalEvent, timeStamp: BigInt): void {
  let id = event.params.src.toHexString() + '-' + event.params.guy.toHexString()
  let daiApproval = daiApprovals.getOrCreateDaiApproval(id, event)
  daiApproval.owner = event.params.src.toHexString()
  daiApproval.spender = event.params.guy.toHexString()
  daiApproval.amount = BigDecimal.fromString('400')
  daiApproval.updatedAt = event.block.timestamp
  daiApproval.createdAt = timeStamp

  daiApproval.save()
}

describe('ERC.20-Dai#handleApproval', () => {
  test('Create DaiApproval', () => {
    let srcStr = '0x0000000000000000000000000000000111111111'
    let dstStr = '0x1111100000000000000000000000000000000000'
    let src = Address.fromString(srcStr)
    let guy = Address.fromString(dstStr)
    let wad = BigInt.fromString('100000000000000000000') // 100 wad

    let event = createEvent(src, guy, wad)
    let idApproval = event.params.src.toHexString() + '-' + event.params.guy.toHexString()

    let timeStampCreate = BigInt.fromString('1110')

    createEntities(event, src, guy)
    createApproval(event, timeStampCreate)

    handleApproval(event)

    assert.fieldEquals('DaiApproval', idApproval, 'owner', srcStr)
    assert.fieldEquals('DaiApproval', idApproval, 'spender', dstStr)
    assert.fieldEquals('DaiApproval', idApproval, 'amount', '100')
    assert.fieldEquals('DaiApproval', idApproval, 'createdAt', timeStampCreate.toString())

    clearStore()
  })

  test('Update DaiApproval', () => {
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
    assert.fieldEquals('DaiApproval', idApproval, 'amount', '100')

    clearStore()
  })
})
