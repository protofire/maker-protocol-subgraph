import { BigInt, Address } from '@graphprotocol/graph-ts'
import { describe, test, assert, clearStore } from 'matchstick-as'
import { Created } from '../../../../../generated/ProxyFactory/DSProxyFactory'
import { handleCreated } from '../../../../../src/mappings/modules/proxy/proxy-factory'
import { tests } from '../../../../../src/mappings/modules/tests'
import { users } from '../../../../../src/entities'
import { system as systemModule } from '../../../../../src/entities'

describe('DSProxyFactory#handleCreated', () => {
  test('Creates UserProxy entity and updates its fields. Updates the SystemState#userProxyCount and the User#proxyCount fields', () => {
    let sender = '0x0000000000000000000000000000000000000001'
    let owner = '0x0000000000000000000000000000000000000002'
    let proxy = '0x0000000000000000000000000000000000000003'
    let cache = '0x0000000000000000000000000000000000000004'

    let event = changetype<Created>(
      tests.helpers.events.getNewEvent([
        tests.helpers.params.getAddress('sender', Address.fromString(sender)),
        tests.helpers.params.getAddress('owner', Address.fromString(owner)),
        tests.helpers.params.getAddress('proxy', Address.fromString(proxy)),
        tests.helpers.params.getAddress('cache', Address.fromString(cache)),
      ]),
    )

    let user = users.getOrCreateUser(event.params.owner)
    user.proxyCount = BigInt.fromString('1')
    user.save()

    let systemState = systemModule.getSystemState(event)
    systemState.userProxyCount = BigInt.fromString('1')
    systemState.save()

    handleCreated(event)

    assert.fieldEquals('SystemState', 'current', 'userProxyCount', '2')
    assert.fieldEquals('User', user.id, 'proxyCount', '2')
    assert.fieldEquals('UserProxy', proxy, 'address', proxy)
    assert.fieldEquals('UserProxy', proxy, 'cache', cache)
    assert.fieldEquals('UserProxy', proxy, 'owner', owner)

    clearStore()
  })
})
