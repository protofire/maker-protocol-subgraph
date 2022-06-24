import { DaiApproval } from '../../generated/schema'
import { ethereum } from '@graphprotocol/graph-ts'

export namespace daiApprovals {
  export function getOrCreateDaiApproval(id: string, event: ethereum.Event): DaiApproval {
    let approval = DaiApproval.load(id)
    if (!approval) {
      approval = new DaiApproval(id)
      approval.createdAt = event.block.timestamp
    }
    return approval as DaiApproval
  }
}
