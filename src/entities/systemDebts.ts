import { decimal } from "@protofire/subgraph-toolkit"
import { SystemDebt } from "../../generated/schema"
export namespace systemDebts {

	export function loadOrCreateSystemDebt(owner: string): SystemDebt {
		let id = `sin-${owner}`
		let entity = SystemDebt.load(id)
		if (entity == null) {
			entity = new SystemDebt(id)
			entity.amount = decimal.ZERO
			entity.owner = owner
		}
		return entity as SystemDebt
	}
}