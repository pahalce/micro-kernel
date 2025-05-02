/* ------------------------------------------------------------------
   Stripe 決済プラグイン（簡易ダミー SDK で再現）
------------------------------------------------------------------- */
import type { KernelAPI } from "../kernel.js";
import type { PaymentGateway, PaymentRequest } from "../types.js";

/* 疑似 Stripe SDK */
async function fakeStripeCharge(req: PaymentRequest) {
  // 実際は Stripe SDK の API 呼び出し
  await new Promise((r) => setTimeout(r, 200));
  return `ch_${Math.random().toString(36).slice(2, 10)}`;
}

const stripePlugin: PaymentGateway = {
  name: "stripe",
  currencies: ["USD", "JPY"],
  async charge(req: PaymentRequest) {
    try {
      const id = await fakeStripeCharge(req);
      return { ok: true, txId: id };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// プラグイン関数をデフォルトエクスポート
export default function stripePluginLoader(api: KernelAPI) {
  api.registerGateway(stripePlugin);
  api.logger.info("Stripe plugin registered");
}
