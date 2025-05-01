/* ------------------------------------------------------------------
   Minimal micro-kernel core  (plugin loader, command & gateway registry)
   ESLint no-explicit-any 回避：unknown / Generics を使用
------------------------------------------------------------------- */

import fs from "node:fs/promises";
import path from "node:path";

import type { PaymentGateway, PaymentRequest, PaymentResult } from "./types.js";

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
	registerGateway(gw: PaymentGateway): void;
}

/* ---------- 内部実装 (EventBus) ---------- */

class SimpleBus implements EventBus {
	/** topic → Set<listener> */
	#listeners = new Map<string, Set<(d: unknown) => void>>();
	publish<T = unknown>(topic: string, data: T) {
		const listeners = this.#listeners.get(topic);
		if (!listeners) return;
		for (const fn of listeners) {
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

		const typed = fn as (d: unknown) => void; // 型を unknown に昇格して保持
		set.add(typed);

		return () => {
			set.delete(typed);
		};
	}
}

/* ---------- Kernel 本体 ---------- */

export class Kernel implements KernelAPI {
	bus = new SimpleBus();
	logger = console;

	/* command registry (今回は使わないが拡張性のため残す) */
	#commands = new Map<string, (...args: unknown[]) => unknown>();

	registerCommand<Args extends unknown[] = [], R = unknown>(
		cmd: string,
		fn: (...args: Args) => R,
	): void {
		if (this.#commands.has(cmd))
			throw new Error(`command "${cmd}" already exists`);
		this.#commands.set(cmd, fn as (...args: unknown[]) => unknown);
	}

	async exec<R = unknown>(cmd: string, ...args: unknown[]): Promise<R> {
		const fn = this.#commands.get(cmd);
		if (!fn) throw new Error(`command "${cmd}" not found`);
		return fn(...args) as R;
	}

	/* ---------------- Payment Gateway 部分 ---------------- */

	#gateways = new Map<string, PaymentGateway>();

	registerGateway(gw: PaymentGateway) {
		if (this.#gateways.has(gw.name))
			throw new Error(`gateway "${gw.name}" already registered`);
		this.#gateways.set(gw.name, gw);
		this.logger.info(`💳  gateway registered: ${gw.name}`);
	}

	async pay(req: PaymentRequest) {
		const gw = this.#gateways.get(req.gateway);
		if (!gw) return { ok: false, error: "unsupported gateway" };
		return gw.charge(req);
	}

	/* ---------------- プラグインローダ -------------------- */

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
