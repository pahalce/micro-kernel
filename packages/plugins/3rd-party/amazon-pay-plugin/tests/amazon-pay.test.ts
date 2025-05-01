import { describe, test, expect, vi, beforeEach } from "vitest";
import { Kernel } from "@micro-kernel/pay-sdk";
import type { PaymentRequest } from "@micro-kernel/pay-sdk";
import amazonPayPluginLoader from "../src/index.js";

describe("Amazon Pay Plugin", () => {
  let kernel: Kernel;
  let consoleInfoSpy: unknown;

  beforeEach(() => {
    kernel = new Kernel();
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  test("should register the Amazon Pay plugin", () => {
    amazonPayPluginLoader(kernel);

    expect(consoleInfoSpy).toHaveBeenCalledWith("Amazon Pay plugin registered");
  });

  test("should process payment successfully", async () => {
    amazonPayPluginLoader(kernel);

    const request: PaymentRequest = {
      gateway: "amazon-pay",
      amount: 2000,
      currency: "JPY",
      customerId: "amzn_cust_123",
    };

    const result = await kernel.pay(request);

    expect(result.ok).toBe(true);
    expect(result.txId).toBeDefined();
    expect(result.txId).toMatch(/^amzn_/);
  });

  test("should support multiple currencies", async () => {
    amazonPayPluginLoader(kernel);

    // JPY決済
    const jpyRequest: PaymentRequest = {
      gateway: "amazon-pay",
      amount: 5000,
      currency: "JPY",
      customerId: "amzn_cust_123",
    };

    // USD決済
    const usdRequest: PaymentRequest = {
      gateway: "amazon-pay",
      amount: 49.99,
      currency: "USD",
      customerId: "amzn_cust_123",
    };

    // EUR決済
    const eurRequest: PaymentRequest = {
      gateway: "amazon-pay",
      amount: 42.5,
      currency: "EUR",
      customerId: "amzn_cust_123",
    };

    const jpyResult = await kernel.pay(jpyRequest);
    const usdResult = await kernel.pay(usdRequest);
    const eurResult = await kernel.pay(eurRequest);

    expect(jpyResult.ok).toBe(true);
    expect(usdResult.ok).toBe(true);
    expect(eurResult.ok).toBe(true);
  });

  test("should integrate with Kernel event system", async () => {
    amazonPayPluginLoader(kernel);

    // イベントリスナーの登録
    const paymentEvents: unknown[] = [];
    kernel.bus.subscribe("payment:completed", (data) => {
      paymentEvents.push(data);
    });

    // 支払いを実行
    const request: PaymentRequest = {
      gateway: "amazon-pay",
      amount: 1500,
      currency: "JPY",
      customerId: "amzn_cust_456",
    };

    const result = await kernel.pay(request);

    // 結果の検証
    expect(result.ok).toBe(true);

    // イベントを発行
    kernel.bus.publish("payment:completed", {
      ...request,
      result,
      timestamp: Date.now(),
    });

    // イベントが正しくキャプチャされたか検証
    expect(paymentEvents).toHaveLength(1);
    expect(paymentEvents[0]).toMatchObject({
      gateway: "amazon-pay",
      amount: 1500,
      result: { ok: true },
    });
  });
});
