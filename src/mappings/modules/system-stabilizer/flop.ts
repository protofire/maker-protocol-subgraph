import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Flop/Flopper'

import { getSystemState } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = getSystemState(event)

  if (what == 'beg') {
    system.debtAuctionMinimumBidIncrease = units.fromWad(data)
  } else if (what == 'pad') {
    system.debtAuctionLotSizeIncrease = units.fromWad(data)
  } else if (what == 'ttl') {
    system.debtAuctionBidDuration = data
  } else if (what == 'tau') {
    system.debtAuctionDuration = data
  }

  system.save()
}
