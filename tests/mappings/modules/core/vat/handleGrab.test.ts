import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { test, clearStore, assert } from "matchstick-as";
import { LogNote } from "../../../../../generated/Vat/Vat";
import { collateralTypes } from "../../../../../src/entities";
import { handleGrab } from "../../../../../src/mappings/modules/core/vat";
import { tests } from "../../../../../src/mappings/modules/tests";
import { mockDebt } from "../../../../helpers/mockedFunctions";

function createEvent(
	collateralTypeId: string,
	u: string,
	v: string,
	w: string,
	dink: string,
	dart: string,
): LogNote {
	let a = new Bytes(100 + 32 - 20)
	let b = a.concat(Bytes.fromHexString(w))
	let c = b.concat(new Bytes(32 - 9))
	let d = c.concat(Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(dink)).reverse()))
	let e = d.concat(new Bytes(32 - 9))
	let f = e.concat(Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(dart)).reverse()))

	let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString("0x1a0b287e"));
	let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(collateralTypeId));
	let arg2 = tests.helpers.params.getBytes("arg2", Bytes.fromHexString(u));
	let arg3 = tests.helpers.params.getBytes("arg3", Bytes.fromHexString(v));
	let data = tests.helpers.params.getBytes("data", f);

	let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
		sig,
		arg1,
		arg2,
		arg3,
		data,
	]));

	return event
}

test(
	"Vat#handleGrab: Liquidates a Vault", () => {
		let collateralTypeId = "c1"
		let u = "0x8195d3496305d2dbe43b21d51e6cc77b6c9c8364"
		let v = "0x9d96b0561be0440ebe93e79fe06a23bbe8270f90"
		let w = "0x3c6e160bf12c814b5c8eadac3e9973dd5b75990f"
		let dink = "100500000000000000000"
		let dart = "200500000000000000000"

		let collateralType = collateralTypes.loadOrCreateCollateralType(collateralTypeId)
		collateralType.rate = BigDecimal.fromString("0.5")
		collateralType.debtNormalized = BigDecimal.fromString("100")
		collateralType.totalDebt = BigDecimal.fromString("50")
		collateralType.save()

		let vaultId = u.concat("-").concat(collateralTypeId)
		let collateralId = v.concat("-").concat(collateralTypeId)
		let systemDebtId = "sin-".concat(w)

		mockDebt()

		let event = createEvent(collateralTypeId, u, v, w, dink, dart)

		handleGrab(event)

		assert.fieldEquals("CollateralType", collateralTypeId, "debtNormalized", "300.5")
		assert.fieldEquals("CollateralType", collateralTypeId, "totalDebt", "100.25")

		assert.fieldEquals("Vault", vaultId, "collateral", "100.5")
		assert.fieldEquals("Vault", vaultId, "debt", "200.5")

		assert.fieldEquals("Collateral", collateralId, "amount", "-100.5")

		assert.fieldEquals("SystemDebt", systemDebtId, "amount", "-100.25")
		assert.fieldEquals("SystemState", "current", "totalSystemDebt", "-100.25")

		clearStore()
	}
)
