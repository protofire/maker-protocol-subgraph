import { Bytes } from '@graphprotocol/graph-ts'

import { LogNote } from '../../../../generated/Jug/Jug'
import { CollateralType } from '../../../../generated/schema'

import { getSystemState } from '../../../entities'

import * as bytes from '../../../utils/bytes'
import * as decimal from '../../../utils/decimal'

// Start stability fee collection for a particular collateral type
export function handleInit(event: LogNote): void {
  let ilk = event.params.arg1.toString()
  let system = getSystemState(event)
  let collateral = CollateralType.load(ilk)

  if (collateral) {
    collateral.stabilityFee = decimal.ONE

    collateral.save()
    system.save()
  }
}

export function handleFile(event: LogNote): void {
  let signature = event.params.sig.toHexString()
  let system = getSystemState(event)

  if (signature == '0x1a0b287e') {
    let ilk = event.params.arg1.toString()
    let what = event.params.arg2.toString()
    let data = bytes.toUnsignedInt(<Bytes>event.params.data.subarray(68, 100))

    if (what == 'duty') {
      let collateral = CollateralType.load(ilk)

      if (collateral) {
        collateral.stabilityFee = decimal.fromRay(data)

        collateral.save()
        system.save()
      }
    }
  } else if (signature == '0x29ae8114') {
    let what = event.params.arg1.toString()
    let data = bytes.toUnsignedInt(event.params.arg2)

    if (what == 'base') {
      system.baseStabilityFee = decimal.fromRay(data)
      system.save()
    }
  }
}
