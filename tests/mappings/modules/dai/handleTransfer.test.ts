import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { test, clearStore, assert, log, describe, beforeEach } from 'matchstick-as'
import { mockDebt } from '../../../helpers/mockedFunctions'
import { handleTransfer } from '../../../../src/mappings/modules/dai/dai'
import { tests } from '../../../../src/mappings/modules/tests'
import { system as systemModule, users } from '../../../../src/entities'
import { Transfer as TransferEvent } from '../../../../generated/Dai/Dai'

function createEvent(src: Address, dst: Address, wad: BigInt): TransferEvent {
  return changetype<TransferEvent>(
    tests.helpers.events.getNewEvent([
      tests.helpers.params.getAddress('src', src),
      tests.helpers.params.getAddress('dst', dst),
      tests.helpers.params.getBigInt('wad', wad),
    ]),
  ) as TransferEvent
}

function createEntities(event: TransferEvent, src: Address, dst: Address): void {
  let system = systemModule.getSystemState(event)
  system.daiTotalSupply = BigDecimal.fromString('1000')
  system.save()

  let userSrc = users.getOrCreateUser(src)
  userSrc.totalDaiBalance = BigDecimal.fromString('100')
  userSrc.save()

  let userDst = users.getOrCreateUser(dst)
  userDst.totalDaiBalance = BigDecimal.fromString('100')
  userDst.save()
}

describe('ERC.20-Dai#handleTransfer', () => {
  beforeEach(() => {
    mockDebt()
  })

  describe('When [src] is Address.zero', () => {
    test('Updates SystemState.daiTotalSupply and TotalErc20Dai from dst User Address. Creates DaiTransfer.', () => {
      let srcStr = '0x0000000000000000000000000000000000000000'
      let dstStr = '0x1111100000000000000000000000000000000000'
      let src = Address.fromString(srcStr)
      let dst = Address.fromString(dstStr)
      let wad = BigInt.fromString('100000000000000000000') // 100 wad

      let event = createEvent(src, dst, wad)
      let transferId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

      createEntities(event, src, dst)

      handleTransfer(event)

      assert.fieldEquals('SystemState', 'current', 'daiTotalSupply', '1100')
      assert.fieldEquals('User', dstStr, 'totalDaiBalance', '200')

      assert.fieldEquals('DaiTransfer', transferId, 'src', srcStr)
      assert.fieldEquals('DaiTransfer', transferId, 'dst', dstStr)
      assert.fieldEquals('DaiTransfer', transferId, 'amount', '100')

      clearStore()
    })
  })

  describe('When [dst] is Address.zero', () => {
    test('Updates SystemState.daiTotalSupply and TotalErc20Dai from src User Address. Creates DaiTransfer.', () => {
      let srcStr = '0x1111100000000000000000000000000000000000'
      let dstStr = '0x0000000000000000000000000000000000000000'
      let src = Address.fromString(srcStr)
      let dst = Address.fromString(dstStr)
      let wad = BigInt.fromString('90000000000000000000') // 90 wad

      let event = createEvent(src, dst, wad)
      let idTransfer = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

      createEntities(event, src, dst)

      handleTransfer(event)

      assert.fieldEquals('SystemState', 'current', 'daiTotalSupply', '910')
      assert.fieldEquals('User', srcStr, 'totalDaiBalance', '10')

      assert.fieldEquals('DaiTransfer', idTransfer, 'src', srcStr)
      assert.fieldEquals('DaiTransfer', idTransfer, 'dst', dstStr)
      assert.fieldEquals('DaiTransfer', idTransfer, 'amount', '90')

      clearStore()
    })
  })

  describe('When [dst & src] are NOT Address.zero', () => {
    test('Updates SystemState.daiTotalSupply and TotalErc20Dai from src & dst User Address. Creates DaiTransfer.', () => {
      let srcStr = '0x1111100000000000000000000000000000000000'
      let dstStr = '0x1111100000000000000000000111111111111111'
      let src = Address.fromString(srcStr)
      let dst = Address.fromString(dstStr)
      let wad = BigInt.fromString('90000000000000000000') // 90 wad

      let event = createEvent(src, dst, wad)
      let idTransfer = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

      createEntities(event, src, dst)

      handleTransfer(event)

      assert.fieldEquals('SystemState', 'current', 'daiTotalSupply', '1000')
      assert.fieldEquals('User', srcStr, 'totalDaiBalance', '10') // src
      assert.fieldEquals('User', dstStr, 'totalDaiBalance', '190') // dst

      assert.fieldEquals('DaiTransfer', idTransfer, 'src', srcStr)
      assert.fieldEquals('DaiTransfer', idTransfer, 'dst', dstStr)
      assert.fieldEquals('DaiTransfer', idTransfer, 'amount', '90')

      clearStore()
    })
  })
})
