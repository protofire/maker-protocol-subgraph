import { Bytes } from "@graphprotocol/graph-ts";
import { test } from "matchstick-as";
import { LogNote } from "../../../../../generated/Vat/Vat";
import { tests } from "../../../../../src/mappings/modules/tests";

test("Vat # handleGrab : Liquidates a Vault", () => {
	let sig = tests.helpers.params.getBytes("sig", Bytes.fromUTF8("sig"));
	let expectedIlk = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8("ilk_id"));
	let arg2 = tests.helpers.params.getBytes("arg2", Bytes.fromUTF8("arg2"));
	let arg3 = tests.helpers.params.getBytes("arg3", Bytes.fromUTF8("arg3"));
	let data = tests.helpers.params.getBytes("data", Bytes.fromUTF8("data"));

	let event = changetype<LogNote>(tests.helpers.events.getNewEvent([

	]))
})
