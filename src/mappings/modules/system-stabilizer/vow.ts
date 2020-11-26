import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Vow/Vow'

import { getSystemState } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = getSystemState(event)

  if (what == 'wait') {
    system.debtAuctionDelay = data
  } else if (what == 'bump') {
    system.surplusAuctionLotSize = units.fromRad(data)
  } else if (what == 'sump') {
    system.debtAuctionBidSize = units.fromRad(data)
  } else if (what == 'dump') {
    system.debtAuctionInitialLotSize = units.fromWad(data)
  } else if (what == 'hump') {
    system.surplusAuctionBuffer = units.fromRad(data)
  }

  system.save()
}
