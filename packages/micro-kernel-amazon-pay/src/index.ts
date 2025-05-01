/* ------------------------------------------------------------------
   Amazon Pay 決済プラグイン
------------------------------------------------------------------- */
import type { KernelAPI } from "micro-kernel-pay/dist/src/kernel.js";
import type {
  PaymentGateway,
  PaymentRequest,
  PaymentResult,
} from "micro-kernel-pay/dist/src/types.js";

/* 疑似 Amazon Pay SDK */
async function fakeAmazonPayCharge(req: PaymentRequest) {
  // 実際は Amazon Pay SDK の API 呼び出し
  await new Promise((r) => setTimeout(r, 300));
  return `amzn_${Math.random().toString(36).slice(2, 10)}`;
}

const amazonPayPlugin: PaymentGateway = {
  name: "amazon-pay",
  currencies: ["USD", "JPY", "EUR"],
  async charge(req: PaymentRequest): Promise<PaymentResult> {
    try {
      const id = await fakeAmazonPayCharge(req);
      return { ok: true, txId: id };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// プラグイン関数をエクスポート
export default function amazonPayPluginLoader(api: KernelAPI) {
  api.registerGateway(amazonPayPlugin);
  api.logger.info("Amazon Pay plugin registered");
}

// プラグイン本体も直接エクスポート
export { amazonPayPlugin };
