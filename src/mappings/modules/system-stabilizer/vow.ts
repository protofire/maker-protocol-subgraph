import { LogNote } from '../../../../generated/Vow/Vow'
import { bytes, decimal } from '@protofire/subgraph-toolkit'

import { getSystemState } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = getSystemState(event)

  if (what == 'wait') {
    system.debtAuctionDelay = data
  } else if (what == 'bump') {
    system.surplusAuctionLotSize = decimal.fromRad(data)
  } else if (what == 'sump') {
    system.debtAuctionBidSize = decimal.fromRad(data)
  } else if (what == 'dump') {
    system.debtAuctionInitialLotSize = decimal.fromWad(data)
  } else if (what == 'hump') {
    system.surplusAuctionBuffer = decimal.fromRad(data)
  }

  system.save()
}
