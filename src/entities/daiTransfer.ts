import { DaiTransfer } from '../../generated/schema'
import { ethereum } from '@graphprotocol/graph-ts'

export namespace DaiTransfers {
  export function loadOrCreateDaiTransfer(id: string, event: ethereum.Event): DaiTransfer {
    let transfer = DaiTransfer.load(id)
    if (!transfer) {
      transfer = new DaiTransfer(id)
      transfer.createdAt = event.block.timestamp
    }
    return transfer
  }
}
