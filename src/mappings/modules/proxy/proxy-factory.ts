import { integer } from '@protofire/subgraph-toolkit'

import { Created } from '../../../../generated/ProxyFactory/DSProxyFactory'
import { UserProxy } from '../../../../generated/schema'

import { users, getSystemState } from '../../../entities'

export function handleCreated(event: Created): void {
  let user = users.getOrCreateUser(event.params.owner)
  user.proxyCount = user.proxyCount.plus(integer.ONE)
  user.save()

  // Register new user proxy
  let proxy = new UserProxy(event.params.proxy.toHexString())
  proxy.address = event.params.proxy
  proxy.cache = event.params.cache
  proxy.owner = user.id
  proxy.save()

  // Update system state
  let system = getSystemState(event)
  system.userProxyCount = system.userProxyCount.plus(integer.ONE)
  system.save()
}
