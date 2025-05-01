import fs from 'node:fs/promises'
import path from 'node:path'

// ----- 公開拡張ポイント定義 -----
export interface EventBus {
  publish<T = any>(topic: string, data: T): void
  subscribe<T = any>(topic: string, fn: (d: T) => void): () => void
}

export interface KernelAPI {
  bus: EventBus
  logger: { info(msg: string): void; error(msg: string): void }
  registerCommand(cmd: string, fn: (...a: any[]) => any): void
}

// ----- 実装 -----
class SimpleBus implements EventBus {
  private listeners = new Map<string, Set<(d: any) => void>>()
  publish(topic: string, data: any) {
    this.listeners.get(topic)?.forEach(fn => fn(data))
  }
  subscribe(topic: string, fn: (d: any) => void) {
    let set = this.listeners.get(topic)
    if (!set) this.listeners.set(topic, (set = new Set()))
    set.add(fn)
    return () => set?.delete(fn)
  }
}

export class Kernel implements KernelAPI {
  bus = new SimpleBus()
  logger = console
  private commands = new Map<string, Function>()

  registerCommand(cmd: string, fn: (...args: any[]) => any) {
    if (this.commands.has(cmd))
      throw new Error(`command ${cmd} already exists`)
    this.commands.set(cmd, fn)
  }

    async exec(cmd: string, ...args: any[]) {
    const fn = this.commands.get(cmd)
    if (!fn) throw new Error(`command ${cmd} not found`)
    return fn(...args)
  }

  async loadPlugins(dir = path.resolve('plugins')) {
    for (const file of await fs.readdir(dir)) {
      // ★ .ts も対象に
      if (!file.match(/\.(c?js|c?ts)$/)) continue

      // 動的 import（ESM）。tsx が .ts を解釈してくれる
      const { default: plug } = await import(path.join(dir, file))
      if (typeof plug === 'function') {
        plug(this as KernelAPI)
        this.logger.info(`loaded plugin: ${file}`)
      }
    }
  }
}
