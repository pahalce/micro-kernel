/* ------------------------------------------------------------------
   PayPal 決済プラグイン（簡易ダミー実装）
------------------------------------------------------------------- */
import type { KernelAPI } from "../kernel.js";
import type {
  PaymentGateway,
  PaymentRequest,
  PaymentResult,
} from "../types.js";

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

// プラグイン関数をデフォルトエクスポート
export default function paypalPluginLoader(api: KernelAPI) {
  api.registerGateway(paypalPlugin);
  api.logger.info("PayPal plugin registered");
}
