import { LogNote } from '../../../../generated/Vow/Vow'

import { getSystemState } from '../../../entities'

import * as bytes from '../../../utils/bytes'
import * as decimal from '../../../utils/decimal'

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
