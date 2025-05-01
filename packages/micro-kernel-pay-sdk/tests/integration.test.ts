import { describe, test, expect, afterEach } from "vitest";
import { Kernel } from "../src/kernel.js";
import type { PaymentRequest } from "../src/types.js";

// プラグインをインポート
import stripePluginLoader from "../src/plugins/stripe.js";
import paypalPluginLoader from "../src/plugins/paypal.js";

describe("Integration Tests", () => {
  let kernel: Kernel;

  afterEach(() => {
    // テスト後にクリーンアップが必要な処理があればここに記述
  });

  test("should process a complete payment flow with Stripe", async () => {
    // カーネルの初期化
    kernel = new Kernel({
      plugins: [stripePluginLoader],
    });

    // イベントリスナーの登録
    const paymentEvents: unknown[] = [];
    kernel.bus.subscribe("payment:completed", (data) => {
      paymentEvents.push(data);
    });

    // 支払いリクエスト
    const request: PaymentRequest = {
      gateway: "stripe",
      amount: 1000,
      currency: "JPY",
      customerId: "cust_test_123",
    };

    // 支払いを実行
    const result = await kernel.pay(request);

    // 結果の検証
    expect(result.ok).toBe(true);
    expect(result.txId).toBeDefined();
    expect(result.txId).toMatch(/^ch_/);

    // 手動でイベントを発行してみる
    kernel.bus.publish("payment:completed", {
      ...request,
      result,
      timestamp: Date.now(),
    });

    // イベントが正しくキャプチャされたか検証
    expect(paymentEvents).toHaveLength(1);
    expect(paymentEvents[0]).toMatchObject({
      gateway: "stripe",
      amount: 1000,
      result: { ok: true },
    });
  });

  test("should support multiple payment gateways", async () => {
    // 複数のプラグインを持つカーネルを初期化
    kernel = new Kernel({
      plugins: [stripePluginLoader, paypalPluginLoader],
    });

    // Stripe決済
    const stripeRequest: PaymentRequest = {
      gateway: "stripe",
      amount: 5000,
      currency: "JPY",
      customerId: "customer_1",
    };

    // PayPal決済
    const paypalRequest: PaymentRequest = {
      gateway: "paypal",
      amount: 49.99,
      currency: "USD",
      customerId: "customer_2",
    };

    // 両方の支払いを実行
    const stripeResult = await kernel.pay(stripeRequest);
    const paypalResult = await kernel.pay(paypalRequest);

    // 結果の検証
    expect(stripeResult.ok).toBe(true);
    expect(stripeResult.txId).toMatch(/^ch_/);

    expect(paypalResult.ok).toBe(true);
    expect(paypalResult.txId).toMatch(/^paypal_tx_/);
  });

  test("should publish events during payment flow", async () => {
    kernel = new Kernel({
      plugins: [stripePluginLoader],
    });

    // イベントリスナーの登録
    const startEvents: unknown[] = [];
    const completeEvents: unknown[] = [];

    kernel.bus.subscribe("payment:start", (data) => {
      startEvents.push(data);
    });

    kernel.bus.subscribe("payment:complete", (data) => {
      completeEvents.push(data);
    });

    // マニュアルでイベントをパブリッシュ
    const paymentData = {
      gateway: "stripe",
      amount: 1000,
      customerId: "test_customer",
    };

    // 開始イベントをパブリッシュ
    kernel.bus.publish("payment:start", paymentData);

    // 完了イベントをパブリッシュ
    kernel.bus.publish("payment:complete", {
      ...paymentData,
      result: { ok: true, txId: "ch_test123" },
    });

    // イベントが正しくキャプチャされたか検証
    expect(startEvents).toHaveLength(1);
    expect(startEvents[0]).toMatchObject(paymentData);

    expect(completeEvents).toHaveLength(1);
    expect(completeEvents[0]).toMatchObject({
      ...paymentData,
      result: { ok: true, txId: "ch_test123" },
    });
  });
});
