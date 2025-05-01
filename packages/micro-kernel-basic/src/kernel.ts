/* ------------------------------------------------------------------
   Minimal micro-kernel core
------------------------------------------------------------------- */

import fs from "node:fs/promises";
import path from "node:path";

/* ---------- 公開インタフェース ---------- */
export interface EventBus {
  publish<T = unknown>(topic: string, data: T): void;
  subscribe<T = unknown>(topic: string, fn: (d: T) => void): () => void;
}

export interface KernelAPI {
  bus: EventBus;
  logger: typeof console;
  registerCommand<Args extends unknown[] = [], R = unknown>(
    cmd: string,
    fn: (...args: Args) => R,
  ): void;
}

/* ---------- 内部実装 ---------- */

class SimpleBus implements EventBus {
  /** topic → Set<listener> */
  #listeners = new Map<string, Set<(d: unknown) => void>>();
  publish<T = unknown>(topic: string, data: T) {
    for (const fn of this.#listeners.get(topic) ?? []) {
      fn(data);
    }
  }

  subscribe<T = unknown>(topic: string, fn: (d: T) => void) {
    const set =
      this.#listeners.get(topic) ??
      (() => {
        const s = new Set<(d: unknown) => void>();
        this.#listeners.set(topic, s);
        return s;
      })();

    // 型を unknown に“昇格”して内部保持
    const typed = fn as (d: unknown) => void;
    set.add(typed);

    /* unsubscribe */
    return () => {
      set.delete(typed);
    };
  }
}

export class Kernel implements KernelAPI {
  bus = new SimpleBus();
  logger = console;

  /** コマンドレジストリ（可変長引数 & 戻り値任意） */
  #commands = new Map<string, (...args: unknown[]) => unknown>();

  registerCommand<Args extends unknown[] = [], R = unknown>(
    cmd: string,
    fn: (...args: Args) => R,
  ) {
    if (this.#commands.has(cmd))
      throw new Error(`command "${cmd}" already exists`);
    // 型を unknown 向けに変換して保存
    this.#commands.set(cmd, fn as (...args: unknown[]) => unknown);
  }

  async exec(cmd: string, ...args: unknown[]) {
    const fn = this.#commands.get(cmd);
    if (!fn) throw new Error(`command "${cmd}" not found`);
    return fn(...args);
  }

  /** plugins ディレクトリ直下の *.ts / *.js / *.mjs / *.cjs を動的 import */
  async loadPlugins(dir = path.resolve("plugins")) {
    for (const file of await fs.readdir(dir)) {
      if (!file.match(/\.(c?[jt]s|mjs)$/)) continue;

      const mod: { default?: unknown } = await import(path.join(dir, file));
      const plug = mod.default;
      if (typeof plug === "function") {
        (plug as (api: KernelAPI) => void)(this);
        this.logger.info(`✅ loaded plugin: ${file}`);
      } else {
        this.logger.warn(`⚠️  plugin ${file} does not export default function`);
      }
    }
  }
}
