import { describe, test, expect, vi, beforeEach } from "vitest";
import { Kernel } from "../src/kernel.js";
import type { PaymentRequest } from "../src/types.js";

// プラグインをインポート
import stripePluginLoader from "../src/plugins/stripe.js";
import paypalPluginLoader from "../src/plugins/paypal.js";

describe("Payment Plugins", () => {
  let kernel: Kernel;
  let consoleInfoSpy: unknown;

  beforeEach(() => {
    kernel = new Kernel();
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  test("should register Stripe plugin", () => {
    stripePluginLoader(kernel);

    expect(consoleInfoSpy).toHaveBeenCalledWith("Stripe plugin registered");

    // 支払いリクエストを実行してプラグインが登録されていることを確認
    const request: PaymentRequest = {
      gateway: "stripe",
      amount: 1000,
      currency: "JPY",
      customerId: "cust_123",
    };

    return expect(kernel.pay(request)).resolves.toMatchObject({
      ok: true,
      txId: expect.stringMatching(/^ch_/),
    });
  });

  test("should register PayPal plugin", () => {
    paypalPluginLoader(kernel);

    // 支払いリクエストを実行
    const request: PaymentRequest = {
      gateway: "paypal",
      amount: 1000,
      currency: "USD",
      customerId: "cust_123",
    };

    return expect(kernel.pay(request)).resolves.toMatchObject({
      ok: true,
      txId: expect.stringMatching(/^paypal_tx_/),
    });
  });

  test("should handle currency validation in Stripe plugin", async () => {
    stripePluginLoader(kernel);

    // JPYとUSDはサポートされている
    const jpyRequest: PaymentRequest = {
      gateway: "stripe",
      amount: 1000,
      currency: "JPY",
      customerId: "cust_123",
    };

    const usdRequest: PaymentRequest = {
      gateway: "stripe",
      amount: 10.99,
      currency: "USD",
      customerId: "cust_123",
    };

    await expect(kernel.pay(jpyRequest)).resolves.toMatchObject({ ok: true });
    await expect(kernel.pay(usdRequest)).resolves.toMatchObject({ ok: true });
  });

  test("should handle currency validation in PayPal plugin", async () => {
    paypalPluginLoader(kernel);

    // PayPalはUSDのみサポート
    const usdRequest: PaymentRequest = {
      gateway: "paypal",
      amount: 10.99,
      currency: "USD",
      customerId: "cust_123",
    };

    await expect(kernel.pay(usdRequest)).resolves.toMatchObject({ ok: true });
  });
});
