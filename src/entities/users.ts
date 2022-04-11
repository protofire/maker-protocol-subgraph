import { Address } from '@graphprotocol/graph-ts'
import { integer } from '@protofire/subgraph-toolkit'

import { User, UserProxy } from '../../generated/schema'

export namespace users {

	export function getOrCreateUser(address: Address): User {
		let id = address.toHexString()
		let user = User.load(id)

		if (user == null) {
			let proxy = UserProxy.load(id)

			if (proxy != null) {
				user = User.load(proxy.owner)
			} else {
				user = new User(id)
				user.address = address
				user.proxyCount = integer.ZERO
				user.vaultCount = integer.ZERO
			}
		}

		return user as User
	}

}