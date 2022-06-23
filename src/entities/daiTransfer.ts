import { DaiTransfer } from '../../generated/schema'
import { ethereum } from '@graphprotocol/graph-ts'

export namespace daiTransfers {
  export function getOrCreateDaiTransfer(id: string, event: ethereum.Event): DaiTransfer {
    let daiTransfer = DaiTransfer.load(id)
    if (!daiTransfer) {
      daiTransfer = new DaiTransfer(id)
      daiTransfer.timestamp = event.block.timestamp
      daiTransfer.block = event.block.number
      daiTransfer.transaction = event.transaction.hash
    }
    return daiTransfer
  }
}
