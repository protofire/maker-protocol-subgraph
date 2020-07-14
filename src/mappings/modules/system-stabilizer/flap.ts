import { bytes, decimal } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Flap/Flapper'

import { getSystemState } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = getSystemState(event)

  if (what == 'beg') {
    system.surplusAuctionMinimumBidIncrease = decimal.fromWad(data)
  } else if (what == 'ttl') {
    system.surplusAuctionBidDuration = data
  } else if (what == 'tau') {
    system.surplusAuctionDuration = data
  }

  system.save()
}
