import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import { Kernel } from "micro-kernel-pay-sdk";
import type { PaymentRequest } from "micro-kernel-pay-sdk";

// 実際のプラグインをインポート
import { stripePlugin, paypalPlugin } from "micro-kernel-pay-sdk/plugins";
import amazonPayPlugin from "micro-kernel-amazon-pay";

// Honoアプリのテスト用に実際のアプリケーションコードを再現したバージョンを作成
function createTestApp() {
  // Kernel作成と実際のプラグインロード
  const kernel = new Kernel({
    plugins: [
      // SDK標準プラグイン
      stripePlugin,
      paypalPlugin,
      // 外部プラグイン
      amazonPayPlugin,
    ],
  });

  // Honoアプリケーション作成
  const app = new Hono();

  app.get("/", (c) => {
    return c.text("Payment Hub Demo");
  });

  app.post("/pay", async (c) => {
    const req = await c.req.json<PaymentRequest>();
    const result = await kernel.pay(req);
    return c.json(result, result.ok ? 200 : 400);
  });

  return { app, kernel };
}

describe("Payment Demo App", () => {
  let app: Hono;
  let kernel: Kernel;

  beforeEach(() => {
    const testEnv = createTestApp();
    app = testEnv.app;
    kernel = testEnv.kernel;

    // console.logのモック化
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should return welcome message at root endpoint", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Payment Hub Demo");
  });

  test("should process payment with Stripe", async () => {
    const res = await app.request("/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gateway: "stripe",
        amount: 5000,
        currency: "JPY",
        customerId: "cust_test_123",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.txId).toMatch(/^ch_/); // 実際のStripeプラグインの取引ID形式
  });

  test("should process payment with PayPal", async () => {
    const res = await app.request("/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gateway: "paypal",
        amount: 49.99,
        currency: "USD",
        customerId: "cust_test_456",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.txId).toMatch(/^paypal_tx_/); // 実際のPayPalプラグインの取引ID形式
  });

  test("should process payment with Amazon Pay", async () => {
    const res = await app.request("/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gateway: "amazon-pay",
        amount: 3000,
        currency: "JPY",
        customerId: "cust_test_789",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.txId).toMatch(/^amzn_/); // 実際のAmazon Payプラグインの取引ID形式
  });

  test("should return error for unknown gateway", async () => {
    const res = await app.request("/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gateway: "unknown-gateway",
        amount: 1000,
        currency: "JPY",
        customerId: "cust_123",
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe("unsupported gateway");
  });
});
