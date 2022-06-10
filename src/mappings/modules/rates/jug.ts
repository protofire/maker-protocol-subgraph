import { Bytes } from '@graphprotocol/graph-ts'
import { bytes, decimal, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Jug/Jug'
import { CollateralType } from '../../../../generated/schema'

import { system as systemModule } from '../../../entities'

// Start stability fee collection for a particular collateral type
export function handleInit(event: LogNote): void {
  let ilk = event.params.arg1.toString()
  let collateralType = CollateralType.load(ilk)

  if (collateralType) {
    collateralType.stabilityFee = decimal.ONE

    collateralType.save()
  }
}

export function handleFile(event: LogNote): void {
  let signature = event.params.sig.toHexString()
  let system = systemModule.getSystemState(event)

  if (signature == '0x1a0b287e') {
    let ilk = event.params.arg1.toString()
    let what = event.params.arg2.toString()
    let data = bytes.toUnsignedInt(event.params.data)

    if (what == 'duty') {
      let collateral = CollateralType.load(ilk)

      if (collateral) {
        collateral.stabilityFee = units.fromRay(data)
        collateral.save()
      }
    }
  } else if (signature == '0x29ae8114') {
    let what = event.params.arg1.toString()
    let data = bytes.toUnsignedInt(event.params.arg2)

    if (what == 'base') {
      system.baseStabilityFee = units.fromRay(data)
      system.save()
    }
  } else if (signature == '0xd4e8be83') {
    let what = event.params.arg1.toString()
    let data = bytes.toAddress(event.params.arg2) // vow: the address of the Vow contract

    if (what == 'vow') {
      system.jugVowContract = data
      system.save()
    }
  }
}
