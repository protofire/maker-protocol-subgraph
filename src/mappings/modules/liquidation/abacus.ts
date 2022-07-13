import { BigDecimal } from '@graphprotocol/graph-ts'
import { units } from '@protofire/subgraph-toolkit'
import { File as FileEvent } from '../../../../generated/StairstepExponentialDecrease/StairstepExponentialDecrease'
import { system as systemModule } from '../../../entities'

export function handleFile(event: FileEvent): void {
  let what = event.params.what.toString()

  if (what == 'cut') {
    let system = systemModule.getSystemState(event)
    system.secondsBetweenPriceDrops = event.params.data
    system.save()
  }

  if (what == 'step') {
    let system = systemModule.getSystemState(event)
    system.multiplicatorFactorPerStep = units.fromRay(event.params.data)
    system.save()
  }
}
