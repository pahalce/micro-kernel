import { describe, test, expect } from "vitest";
import { Kernel } from "micro-kernel-pay-sdk";
import type { PaymentGateway, PaymentRequest } from "micro-kernel-pay-sdk";

// カスタムプラグインでのバリデーション実装サンプル
describe("通貨バリデーション", () => {
  test("通貨バリデーションが正しく機能すること", async () => {
    const kernel = new Kernel();

    // 通貨バリデーションを持つカスタムゲートウェイ
    const customGateway: PaymentGateway = {
      name: "custom-gateway",
      currencies: ["JPY", "USD"],
      async charge(req: PaymentRequest) {
        // サポートする通貨かどうかを検証
        if (!this.currencies.includes(req.currency)) {
          return {
            ok: false,
            error: `通貨 ${
              req.currency
            } はサポートされていません。サポート通貨: ${this.currencies.join(
              ", ",
            )}`,
          };
        }

        // 通貨によって金額の検証ロジックを変える
        if (
          req.currency === "JPY" &&
          (!Number.isInteger(req.amount) || req.amount < 100)
        ) {
          return {
            ok: false,
            error: "JPYの場合、金額は100以上の整数である必要があります",
          };
        }

        if (req.currency === "USD" && req.amount < 1) {
          return {
            ok: false,
            error: "USDの場合、金額は1ドル以上である必要があります",
          };
        }

        // バリデーション通過時の処理
        return {
          ok: true,
          txId: `val-tx-${Date.now()}`,
        };
      },
    };

    // ゲートウェイを登録
    kernel.registerGateway(customGateway);

    // 正常系: JPY (整数、100以上)
    const validJpyRequest: PaymentRequest = {
      gateway: "custom-gateway",
      amount: 1000,
      currency: "JPY",
      customerId: "test_customer",
    };

    const jpyResult = await kernel.pay(validJpyRequest);
    expect(jpyResult.ok).toBe(true);
    expect(jpyResult.txId).toBeDefined();

    // 正常系: USD (1ドル以上)
    const validUsdRequest: PaymentRequest = {
      gateway: "custom-gateway",
      amount: 10.99,
      currency: "USD",
      customerId: "test_customer",
    };

    const usdResult = await kernel.pay(validUsdRequest);
    expect(usdResult.ok).toBe(true);
    expect(usdResult.txId).toBeDefined();

    // 異常系: 未サポート通貨
    const invalidCurrencyRequest = {
      gateway: "custom-gateway",
      amount: 1000,
      currency: "EUR", // 型定義には存在するが、このゲートウェイではサポートされていない
      customerId: "test_customer",
    } as PaymentRequest;

    const invalidCurrencyResult = await kernel.pay(invalidCurrencyRequest);
    expect(invalidCurrencyResult.ok).toBe(false);
    expect(invalidCurrencyResult.error).toContain(
      "通貨 EUR はサポートされていません",
    );

    // 異常系: JPYの金額が少なすぎる
    const lowJpyRequest: PaymentRequest = {
      gateway: "custom-gateway",
      amount: 50,
      currency: "JPY",
      customerId: "test_customer",
    };

    const lowJpyResult = await kernel.pay(lowJpyRequest);
    expect(lowJpyResult.ok).toBe(false);
    expect(lowJpyResult.error).toContain("JPYの場合、金額は100以上");

    // 異常系: USDの金額が少なすぎる
    const lowUsdRequest: PaymentRequest = {
      gateway: "custom-gateway",
      amount: 0.5,
      currency: "USD",
      customerId: "test_customer",
    };

    const lowUsdResult = await kernel.pay(lowUsdRequest);
    expect(lowUsdResult.ok).toBe(false);
    expect(lowUsdResult.error).toContain("USDの場合、金額は1ドル以上");
  });

  test("複数通貨のゲートウェイでは、それぞれの通貨が検証されること", async () => {
    const kernel = new Kernel();

    // 複数通貨対応のカスタムゲートウェイ
    const multiCurrencyGateway: PaymentGateway = {
      name: "multi-currency-gateway",
      currencies: ["JPY", "USD", "EUR"],
      async charge(req: PaymentRequest) {
        // サポートする通貨かどうかを検証
        if (!this.currencies.includes(req.currency)) {
          return {
            ok: false,
            error: `通貨 ${req.currency} はサポートされていません`,
          };
        }

        // 通貨ごとの最小金額
        const minimumAmounts: Record<string, number> = {
          JPY: 100,
          USD: 1,
          EUR: 1,
        };

        const minAmount = minimumAmounts[req.currency] || 0;
        if (req.amount < minAmount) {
          return {
            ok: false,
            error: `${req.currency}の最小金額は${minAmount}です`,
          };
        }

        return {
          ok: true,
          txId: `multi-tx-${Date.now()}`,
        };
      },
    };

    // ゲートウェイを登録
    kernel.registerGateway(multiCurrencyGateway);

    // EURでのリクエスト (EURは型定義に追加されているので型キャストは不要)
    const eurRequest: PaymentRequest = {
      gateway: "multi-currency-gateway",
      amount: 50,
      currency: "EUR",
      customerId: "test_customer",
    };

    const eurResult = await kernel.pay(eurRequest);
    expect(eurResult.ok).toBe(true);
    expect(eurResult.txId).toBeDefined();
  });
});
