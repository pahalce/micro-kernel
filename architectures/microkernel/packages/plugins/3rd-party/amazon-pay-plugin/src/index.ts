/* ------------------------------------------------------------------
   Amazon Pay 決済プラグイン
------------------------------------------------------------------- */
import type {
  Kernel,
  PaymentGateway,
  PaymentRequest,
} from "@arch/microkernel-pay-sdk";

/* 疑似 Amazon Pay SDK */
async function fakeAmazonPayCharge(req: PaymentRequest) {
  // 実際は Amazon Pay SDK の API 呼び出し
  await new Promise((r) => setTimeout(r, 300));
  return `amzn_${Math.random().toString(36).slice(2, 10)}`;
}

const amazonPayPlugin: PaymentGateway = {
  name: "amazon-pay",
  currencies: ["USD", "JPY", "EUR"],
  async charge(req: PaymentRequest) {
    try {
      const id = await fakeAmazonPayCharge(req);
      return { ok: true, txId: id };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};

// プラグイン関数をエクスポート
export default function amazonPayPluginLoader(api: Kernel) {
  api.registerGateway(amazonPayPlugin);
  api.logger.info("Amazon Pay plugin registered");
}
