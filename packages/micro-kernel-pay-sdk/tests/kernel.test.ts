import { describe, test, expect, vi } from "vitest";
import { Kernel } from "../src/kernel.js";
import type { PaymentGateway, PaymentRequest } from "../src/types.js";

describe("Kernel", () => {
  test("should create a kernel instance", () => {
    const kernel = new Kernel();
    expect(kernel).toBeInstanceOf(Kernel);
  });

  test("should register a gateway", () => {
    const kernel = new Kernel();
    const mockGateway: PaymentGateway = {
      name: "test-gateway",
      currencies: ["JPY"],
      charge: vi.fn(),
    };

    kernel.registerGateway(mockGateway);

    // gatewaysは非公開プロパティなので支払い処理を通してテスト
    const mockRequest: PaymentRequest = {
      gateway: "test-gateway",
      amount: 1000,
      currency: "JPY",
      customerId: "cust_123",
    };

    kernel.pay(mockRequest);
    expect(mockGateway.charge).toHaveBeenCalledWith(mockRequest);
  });

  test("should fail with unknown gateway", async () => {
    const kernel = new Kernel();
    const mockRequest: PaymentRequest = {
      gateway: "unknown-gateway",
      amount: 1000,
      currency: "JPY",
      customerId: "cust_123",
    };

    const result = await kernel.pay(mockRequest);
    expect(result).toEqual({ ok: false, error: "unsupported gateway" });
  });

  test("should register a command and execute it", async () => {
    const kernel = new Kernel();
    const mockFn = vi.fn().mockReturnValue("test-result");

    kernel.registerCommand("test-command", mockFn);
    const result = await kernel.exec("test-command", "arg1", "arg2");

    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    expect(result).toBe("test-result");
  });

  test("should fail when executing unknown command", async () => {
    const kernel = new Kernel();

    await expect(kernel.exec("unknown-command")).rejects.toThrow(
      'command "unknown-command" not found',
    );
  });

  test("should throw when registering duplicate gateway", () => {
    const kernel = new Kernel();
    const mockGateway: PaymentGateway = {
      name: "duplicate-gateway",
      currencies: ["JPY"],
      charge: vi.fn(),
    };

    kernel.registerGateway(mockGateway);

    expect(() => {
      kernel.registerGateway(mockGateway);
    }).toThrow('gateway "duplicate-gateway" already registered');
  });

  test("should throw when registering duplicate command", () => {
    const kernel = new Kernel();

    kernel.registerCommand("duplicate-command", () => {});

    expect(() => {
      kernel.registerCommand("duplicate-command", () => {});
    }).toThrow('command "duplicate-command" already exists');
  });
});
