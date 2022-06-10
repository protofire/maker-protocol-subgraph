import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Pot/Pot'

import { system as systemModule } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)
  let signature = event.params.sig.toHexString()

  if (signature == '0x29ae8114') {
    if (what == 'dsr') {
      let system = systemModule.getSystemState(event)
      system.savingsRate = units.fromRay(data)
      system.save()
    }
  } else if (signature == '0xd4e8be83') {
    if (what == 'dsr') {
    }
  }
}
