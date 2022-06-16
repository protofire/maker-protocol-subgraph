import { DaiApproval } from '../../generated/schema'
import { ethereum } from '@graphprotocol/graph-ts'

export namespace DaiApprovals {
  export function loadOrCreateDaiApproval(id: string, event: ethereum.Event): DaiApproval {
    let approval = DaiApproval.load(id)
    if (!approval) {
      approval = new DaiApproval(id)
    }
    return approval as DaiApproval
  }
}
