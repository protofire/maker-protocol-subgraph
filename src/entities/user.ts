import { Address } from '@graphprotocol/graph-ts'
import { integer } from '@protofire/subgraph-toolkit'

import { User, UserProxy } from '../../generated/schema'

export function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString())

  if (user == null) {
    let proxy = UserProxy.load(address.toHexString())

    if (proxy != null) {
      user = User.load(proxy.owner)
    } else {
      user = new User(address.toHexString())
      user.address = address
      user.proxyCount = integer.ZERO
      user.vaultCount = integer.ZERO
    }
  }

  return user as User
}
