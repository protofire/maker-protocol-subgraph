import { Bytes } from '@graphprotocol/graph-ts'
import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote, Poke } from '../../../../generated/Spot/Spotter'
import { CollateralPrice, CollateralType } from '../../../../generated/schema'

import { system } from '../../../entities'

export function handleFile(event: LogNote): void {
  let ilk = event.params.arg1.toString()
  let what = event.params.arg2.toString()
  let data = bytes.toUnsignedInt(changetype<Bytes>(event.params.data.subarray(68, 100)))

  if (what == 'mat') {
    let collateral = CollateralType.load(ilk)

    if (collateral != null) {
      collateral.liquidationRatio = units.fromRay(data)

      collateral.modifiedAt = event.block.timestamp
      collateral.modifiedAtBlock = event.block.number
      collateral.modifiedAtTransaction = event.transaction.hash

      collateral.save()

      let state = system.getSystemState(event)
      state.save()
    }
  }
}

export function handlePoke(event: Poke): void {
  let ilk = event.params.ilk.toString()
  let val = bytes.toUnsignedInt(event.params.val)

  let collateral = CollateralType.load(ilk)

  if (collateral != null) {
    let price = new CollateralPrice(event.block.number.toString() + '-' + ilk)
    price.block = event.block.number
    price.collateral = collateral.id
    price.spotPrice = units.fromRay(event.params.spot)
    price.timestamp = event.block.timestamp
    price.value = units.fromWad(val)
    price.save()

    collateral.price = price.id
    collateral.save()
  }
}
