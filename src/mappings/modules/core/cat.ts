import { Bytes, DataSourceContext } from '@graphprotocol/graph-ts'
import { bytes, decimal } from '@protofire/subgraph-toolkit'

import { Bite, LogNote } from '../../../../generated/Cat/Cat'
import { Flip } from '../../../../generated/templates'

import { CollateralType } from '../../../entities'

export function handleFile(event: LogNote): void {
  let ilk = event.params.arg1.toString()
  let what = event.params.arg2.toString()
  let signature = event.params.sig.toHexString()

  if (signature == '0x1a0b287e') {
    let collateral = CollateralType.load(ilk)

    if (collateral != null) {
      let data = bytes.toUnsignedInt(<Bytes>event.params.data.subarray(68, 100))

      if (what == 'chop') {
        collateral.liquidationPenalty = units.fromRay(data)
      } else if (what == 'lump') {
        collateral.liquidationLotSize = units.fromWad(data)
      }

      collateral.save()
    }
  } else if (signature == '0xebecb39d') {
    let flip = bytes.toAddress(<Bytes>event.params.data.subarray(68, 100))

    // Create dynamic data source for collateral liquidator
    let context = new DataSourceContext()
    context.setString('collateral', ilk)

    Flip.createWithContext(flip, context)
  }
}

export function handleBite(event: Bite): void {
  // TODO
}
