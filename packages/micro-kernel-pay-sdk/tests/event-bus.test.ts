import { describe, test, expect, vi } from "vitest";
import { Kernel } from "../src/kernel.js";

describe("EventBus", () => {
  test("should publish and subscribe to events", () => {
    const kernel = new Kernel();
    const mockHandler = vi.fn();

    // イベントをサブスクライブ
    const unsubscribe = kernel.bus.subscribe("test-event", mockHandler);

    // イベントをパブリッシュ
    const eventData = { message: "Hello World" };
    kernel.bus.publish("test-event", eventData);

    expect(mockHandler).toHaveBeenCalledWith(eventData);

    // 2回パブリッシュするとハンドラも2回呼ばれるはず
    kernel.bus.publish("test-event", eventData);
    expect(mockHandler).toHaveBeenCalledTimes(2);

    // アンサブスクライブするとそれ以降はハンドラが呼ばれない
    unsubscribe();
    kernel.bus.publish("test-event", eventData);
    expect(mockHandler).toHaveBeenCalledTimes(2); // 回数は変わらない
  });

  test("should handle multiple subscribers to the same topic", () => {
    const kernel = new Kernel();
    const mockHandler1 = vi.fn();
    const mockHandler2 = vi.fn();

    kernel.bus.subscribe("shared-topic", mockHandler1);
    kernel.bus.subscribe("shared-topic", mockHandler2);

    const eventData = { value: 42 };
    kernel.bus.publish("shared-topic", eventData);

    expect(mockHandler1).toHaveBeenCalledWith(eventData);
    expect(mockHandler2).toHaveBeenCalledWith(eventData);
  });

  test("should not notify subscribers of different topics", () => {
    const kernel = new Kernel();
    const mockHandler1 = vi.fn();
    const mockHandler2 = vi.fn();

    kernel.bus.subscribe("topic-1", mockHandler1);
    kernel.bus.subscribe("topic-2", mockHandler2);

    kernel.bus.publish("topic-1", { msg: "for topic 1" });

    expect(mockHandler1).toHaveBeenCalledTimes(1);
    expect(mockHandler2).not.toHaveBeenCalled();
  });

  test("should do nothing when publishing to a topic with no subscribers", () => {
    const kernel = new Kernel();
    // イベントをパブリッシュしても何も起きないはず（エラーが発生しないこと）
    expect(() => {
      kernel.bus.publish("no-subscribers", { data: true });
    }).not.toThrow();
  });

  test("should handle unsubscribing multiple times gracefully", () => {
    const kernel = new Kernel();
    const mockHandler = vi.fn();

    const unsubscribe = kernel.bus.subscribe("test-topic", mockHandler);

    // 1回目のアンサブスクライブは成功するはず
    expect(() => unsubscribe()).not.toThrow();

    // 2回目のアンサブスクライブも（エラーが発生せず）成功するはず
    expect(() => unsubscribe()).not.toThrow();
  });
});
