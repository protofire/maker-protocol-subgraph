import { LogNote } from '../../../../generated/Pot/Pot'

import { getSystemState } from '../../../entities'

import * as bytes from '../../../utils/bytes'
import * as decimal from '../../../utils/decimal'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  if (what == 'dsr') {
    let system = getSystemState(event)
    system.savingsRate = decimal.fromRay(data)
    system.save()
  }
}
