import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Flap/Flapper'

import { system as systemModule } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = systemModule.getSystemState(event)

  if (what == 'beg') {
    system.surplusAuctionMinimumBidIncrease = units.fromWad(data)
  } else if (what == 'ttl') {
    system.surplusAuctionBidDuration = data
  } else if (what == 'tau') {
    system.surplusAuctionDuration = data
  }

  system.save()
}
