import { bytes, decimal } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Pot/Pot'

import { getSystemState } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  if (what == 'dsr') {
    let system = getSystemState(event)
    system.savingsRate = decimal.fromRay(data)
    system.save()
  }
}
