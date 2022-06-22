import { DaiTransfer } from '../../generated/schema'
import { ethereum } from '@graphprotocol/graph-ts'

export namespace daiTransfers {
  export function getOrCreateDaiTransfer(id: string, event: ethereum.Event): DaiTransfer {
    let transfer = DaiTransfer.load(id)
    if (!transfer) {
      transfer = new DaiTransfer(id)
      transfer.createdAt = event.block.timestamp
    }
    return transfer
  }
}
