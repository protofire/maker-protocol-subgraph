import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Pot/Pot'

import { system as systemModule } from '../../../entities'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()

  let signature = event.params.sig.toHexString()

  if (signature == '0x29ae8114') {
    if (what == 'dsr') {
      let system = systemModule.getSystemState(event)
      let data = bytes.toUnsignedInt(event.params.arg2)

      system.savingsRate = units.fromRay(data) // Dai Savings Rate
      system.save()
    }
  } else if (signature == '0xd4e8be83') {
    if (what == 'vow') {
      let system = systemModule.getSystemState(event)
      let data = bytes.toAddress(event.params.arg2)
      system.potVowContract = data
      system.save()
    }
  }
}
