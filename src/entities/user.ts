import { Address } from '@graphprotocol/graph-ts'

import { User } from '../../generated/schema'

export function getOrCreateUser(address: Address, persist: boolean = true): User {
  let user = User.load(address.toHexString())

  if (user == null) {
    user = new User(address.toHexString())
    user.address = address

    if (persist) {
      user.save()
    }
  }

  return user as User
}
