/* ------------------------------------------------------------------
   PayPal 決済プラグイン（簡易ダミー実装）
------------------------------------------------------------------- */
import type { KernelAPI } from "../src/kernel.ts";
import type {
	PaymentGateway,
	PaymentRequest,
	PaymentResult,
} from "../src/types.ts";

async function fakePaypalCharge(req: PaymentRequest) {
	// 実際は PayPal REST API 呼び出し
	await new Promise((r) => setTimeout(r, 150));
	return `paypal_tx_${Date.now()}`;
}

const paypalPlugin: PaymentGateway = {
	name: "paypal",
	currencies: ["USD"],
	async charge(req: PaymentRequest) {
		try {
			const id = await fakePaypalCharge(req);
			return { ok: true, txId: id };
		} catch (e) {
			return { ok: false, error: String(e) };
		}
	},
};

export default (api: KernelAPI) => {
	api.registerGateway(paypalPlugin);
};
