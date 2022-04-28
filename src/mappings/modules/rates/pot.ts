import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Pot/Pot'

import { system as systemModule } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  if (what == 'dsr') {
    let system = systemModule.getSystemState(event)
    system.savingsRate = units.fromRay(data)
    system.save()
  }
}
