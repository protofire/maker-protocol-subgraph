import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { clearStore, describe, test, assert, beforeEach, afterEach } from 'matchstick-as'
import { MkrApproval, User } from '../../../../generated/schema'
import { Approval as ApprovalEvent } from '../../../../generated/Token/DSToken'
import { users } from '../../../../src/entities'
import { handleApproval } from '../../../../src/mappings/modules/mkr/dsToken'
import { tests } from '../../../../src/mappings/modules/tests'

function createEvent(owner: Address, spender: Address, value: BigInt): ApprovalEvent {
  return changetype<ApprovalEvent>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getAddress('owner', owner),
      tests.helpers.params.getAddress('spender', spender),
      tests.helpers.params.getBigInt('value', value),
    ]),
  )
}

let ownerAddress: Address
let spenderAddress: Address
let ownerUser: User
let spenderUser: User
let mkrApproval: MkrApproval
let mkrApprovalId: string

describe('Mkr#handleApproval', () => {
  beforeEach(() => {
    ownerAddress = Address.fromString('0x60b86af869f23aeb552fb7f3cabd11b829f6ab2f')
    spenderAddress = Address.fromString('0x04f7c549cbef0d1be860dc334a307c260179c34c')
    ownerUser = users.getOrCreateUser(ownerAddress)
    ownerUser.save()
    spenderUser = users.getOrCreateUser(spenderAddress)
    spenderUser.save()

    mkrApprovalId = ownerAddress
      .toString()
      .concat('-')
      .concat(spenderAddress.toString())
  })

  afterEach(() => {
    clearStore()
  })

  describe('when MkrApproval does not exist yet', () => {
    test('creates MkrApproval', () => {
      let amount = BigInt.fromString('1000000000000000000000') // wad

      let event = createEvent(ownerAddress, spenderAddress, amount)

      handleApproval(event)

      assert.fieldEquals('MkrApproval', mkrApprovalId, 'owner', ownerUser.id)
      assert.fieldEquals('MkrApproval', mkrApprovalId, 'spender', spenderUser.id)
      assert.fieldEquals('MkrApproval', mkrApprovalId, 'amount', '1000')
      assert.fieldEquals('MkrApproval', mkrApprovalId, 'createdAt', event.block.timestamp.toString())
      assert.fieldEquals('MkrApproval', mkrApprovalId, 'updatedAt', event.block.timestamp.toString())
    })
  })

  describe('when MkrApproval exist', () => {
    beforeEach(() => {
      mkrApproval = new MkrApproval(mkrApprovalId)
      mkrApproval.owner = ownerUser.id
      mkrApproval.spender = spenderUser.id
      mkrApproval.amount = BigDecimal.fromString('1000')
      mkrApproval.createdAt = BigInt.fromString('1234')
      mkrApproval.updatedAt = BigInt.fromString('1234')
      mkrApproval.save()
    })

    test('updates MrkApproval', () => {
      let amount = BigInt.fromString('2000000000000000000000') // wad

      let event = createEvent(ownerAddress, spenderAddress, amount)

      handleApproval(event)

      assert.fieldEquals('MkrApproval', mkrApprovalId, 'amount', '2000')
      assert.fieldEquals('MkrApproval', mkrApprovalId, 'createdAt', mkrApproval.createdAt.toString())
      assert.fieldEquals('MkrApproval', mkrApprovalId, 'updatedAt', event.block.timestamp.toString())
    })
  })
})
