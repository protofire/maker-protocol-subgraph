import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts'
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
        user.totalVaultDai = BigDecimal.zero()
        user.totalDaiBalance = BigDecimal.zero()
        user.proxyCount = integer.ZERO
        user.vaultCount = integer.ZERO
      }
    }

    return user as User
  }

  export function plusBalanceERC20Dai(to: Address, value: BigDecimal): void {
    let user = getOrCreateUser(to)

    user.totalDaiBalance = user.totalDaiBalance.plus(value)
    user.save()
  }

  export function minusBalanceERC20Dai(from: Address, value: BigDecimal): void {
    let user = getOrCreateUser(from)
    user.totalDaiBalance = user.totalDaiBalance.minus(value)
    user.save()
  }

  export function commitBalanceERC20Dai(from: Address, to: Address, value: BigDecimal): void {
    plusBalanceERC20Dai(to, value)
    minusBalanceERC20Dai(from, value)
  }
}
