// src/storageAdapters.ts
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clearAll(): Promise<void>;
}

/** Browser localStorage adapter (uses localStorage) */
export class BrowserStorageAdapter implements StorageAdapter {
  constructor(private prefix = "__secure_client_store__") {}
  async getItem(key: string) {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(this.prefix + key);
  }
  async setItem(key: string, value: string) {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(this.prefix + key, value);
  }
  async removeItem(key: string) {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(this.prefix + key);
  }
  async clearAll() {
    if (typeof window === "undefined" || !window.localStorage) return;
    // careful: only clear keys with our prefix
    const keys = Object.keys(window.localStorage);
    for (const k of keys) {
      if (k.startsWith(this.prefix)) window.localStorage.removeItem(k);
    }
  }
}

/** Node filesystem adapter (stores a small JSON in temp dir) */
export class NodeFsStorageAdapter implements StorageAdapter {
  filePath: string;
  constructor(filename = "secure-client-store.json") {
    const dir = os.tmpdir();
    this.filePath = path.join(dir, filename);
    // ensure file exists
    if (!fs.existsSync(this.filePath)) {
      try { fs.writeFileSync(this.filePath, JSON.stringify({})); } catch {}
    }
  }

  private readObj(): Record<string, string> {
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(raw || "{}");
    } catch {
      return {};
    }
  }
  private writeObj(obj: Record<string, string>) {
    fs.writeFileSync(this.filePath, JSON.stringify(obj), { encoding: "utf8" });
  }

  async getItem(key: string) {
    const obj = this.readObj();
    return obj[key] ?? null;
  }
  async setItem(key: string, value: string) {
    const obj = this.readObj();
    obj[key] = value;
    this.writeObj(obj);
  }
  async removeItem(key: string) {
    const obj = this.readObj();
    delete obj[key];
    this.writeObj(obj);
  }
  async clearAll() {
    this.writeObj({});
  }
}
