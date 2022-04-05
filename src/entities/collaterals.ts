import { BigDecimal } from "@graphprotocol/graph-ts"
import { decimal } from "@protofire/subgraph-toolkit"
import { Collateral } from "../../generated/schema"

export namespace collaterals {
	function getGemId(ilk: string, user: string) {
		return `${user}-${ilk}`
	}

	export function loadOrCreateCollateral(ilk: string, owner: string): Collateral {
		let id = getGemId(ilk, owner)
		let entity = Collateral.load(id)
		if (entity == null) {
			entity = new Collateral(id)
			entity.type = ilk
			entity.amount = decimal.ZERO
		}
		return entity as Collateral
	}

}