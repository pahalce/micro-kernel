/* ------------------------------------------------------------------
   Stripe 決済プラグイン（簡易ダミー SDK で再現）
------------------------------------------------------------------- */
import type { KernelAPI } from "../src/kernel.ts";
import type {
	PaymentGateway,
	PaymentRequest,
	PaymentResult,
} from "../src/types.ts";

/* 疑似 Stripe SDK */
async function fakeStripeCharge(req: PaymentRequest) {
	// 実際は Stripe SDK の API 呼び出し
	await new Promise((r) => setTimeout(r, 200));
	return `ch_${Math.random().toString(36).slice(2, 10)}`;
}

const stripePlugin: PaymentGateway = {
	name: "stripe",
	currencies: ["USD", "JPY"],
	async charge(req: PaymentRequest): Promise<PaymentResult> {
		try {
			const id = await fakeStripeCharge(req);
			return { ok: true, txId: id };
		} catch (e) {
			return { ok: false, error: String(e) };
		}
	},
};

export default (api: KernelAPI) => {
	api.registerGateway(stripePlugin);
};
