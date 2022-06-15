import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { clearStore, describe, test, assert } from 'matchstick-as'
import { Transfer as TransferEvent } from '../../../../generated/Token/DSToken'
import { users } from '../../../../src/entities'
import { handleTransfer } from '../../../../src/mappings/modules/mkr/dsToken'
import { tests } from '../../../../src/mappings/modules/tests'

function createEvent(from: Address, to: Address, value: BigInt): TransferEvent {
  return changetype<TransferEvent>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getAddress('from', from),
      tests.helpers.params.getAddress('to', to),
      tests.helpers.params.getBigInt('value', value),
    ]),
  )
}

describe('Mkr#handleTransfer', () => {
  test('updates totalMkrBalance and logs the transfer', () => {
    let srcAddress = Address.fromString('0x60b86af869f23aeb552fb7f3cabd11b829f6ab2f')
    let dstAddress = Address.fromString('0x04f7c549cbef0d1be860dc334a307c260179c34c')
    let srcUser = users.getOrCreateUser(srcAddress)
    srcUser.totalMkrBalance = BigDecimal.fromString('5000')
    srcUser.save()
    let dstUser = users.getOrCreateUser(dstAddress)
    dstUser.totalMkrBalance = BigDecimal.fromString('100')
    dstUser.save()

    let amount = BigInt.fromString('100000000000000000000') // wad

    let event = createEvent(srcAddress, dstAddress, amount)

    let id = srcAddress
      .toString()
      .concat('-')
      .concat(dstAddress.toString())
      .concat('-')
      .concat(event.transaction.hash.toHex())

    handleTransfer(event)

    assert.fieldEquals('User', '0x60b86af869f23aeb552fb7f3cabd11b829f6ab2f', 'totalMkrBalance', '4900')
    assert.fieldEquals('User', '0x04f7c549cbef0d1be860dc334a307c260179c34c', 'totalMkrBalance', '200')

    assert.fieldEquals('MkrTransfer', id, 'src', srcUser.id)
    assert.fieldEquals('MkrTransfer', id, 'dst', dstUser.id)
    assert.fieldEquals('MkrTransfer', id, 'amount', '100')
    assert.fieldEquals('MkrTransfer', id, 'transaction', event.transaction.hash.toHexString())
    assert.fieldEquals('MkrTransfer', id, 'block', event.block.number.toString())
    assert.fieldEquals('MkrTransfer', id, 'timestamp', event.block.timestamp.toString())

    clearStore()
  })
})
