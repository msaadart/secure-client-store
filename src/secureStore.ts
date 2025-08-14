// src/secureStore.ts
import { getSubtleCrypto, isBrowser } from "./env";
import { StorageAdapter, BrowserStorageAdapter, NodeFsStorageAdapter } from "./storageAdapters";

const STORAGE_KEY = "client_enc_key_v1";
const IV_BYTES = 12;

function bufToBase64(buf: ArrayBuffer | Uint8Array) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary);
}
function base64ToU8(s: string) {
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

export type SecureStoreOptions = {
  storageAdapter?: StorageAdapter;
  storageKeyName?: string;
  autoClearTimeout?: number;
  userKey?: string; // NEW: allow user to provide their own key (base64 string or raw Uint8Array)
};

export class SecureStore {
  private subtle: SubtleCrypto;
  private key: CryptoKey | null = null;
  private adapter: StorageAdapter;
  private storageKeyName: string;
  private timeoutId: any = null;
  private autoClearDefault = 9 * 60 * 60 * 1000; // 9 hours
  private userKey?: string; // NEW

  constructor(opts?: SecureStoreOptions) {
    this.subtle = getSubtleCrypto();
    this.adapter = opts?.storageAdapter ?? (isBrowser ? new BrowserStorageAdapter() : new NodeFsStorageAdapter());
    this.storageKeyName = opts?.storageKeyName ?? STORAGE_KEY;
    if (opts?.autoClearTimeout) this.autoClearDefault = opts.autoClearTimeout;
    if (opts?.userKey) this.userKey = opts.userKey; // store user key
  }

  // Initialize key if not already present
  async initializeKey(): Promise<void> {
    if (this.key) return;

    if (this.userKey) {
      const raw = base64ToU8(this.userKey).buffer;
      this.key = await this.subtle.importKey(
        "raw",
        raw,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      return; // Skip generation
    }

    const stored = await this.adapter.getItem(this.storageKeyName);
    if (stored) {
      const raw = base64ToU8(stored).buffer;
      this.key = await this.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    } else {
      const rawKey = await this.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
      this.key = rawKey;
      const exported = await this.subtle.exportKey("raw", this.key);
      await this.adapter.setItem(this.storageKeyName, bufToBase64(exported));
    }
  }


  /** Encrypt string -> base64 (iv + ciphertext) */
  async encrypt(data: string): Promise<string> {
    if (!this.key) await this.initializeKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

    const encoded = new TextEncoder().encode(data);
    const ct = await this.subtle.encrypt({ name: "AES-GCM", iv }, this.key!, encoded);

    // combine iv + ct
    const combined = new Uint8Array(iv.byteLength + ct.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ct), iv.byteLength);

    return bufToBase64(combined);
  }

  /** Decrypt base64 -> string */
  async decrypt(encryptedBase64: string): Promise<string> {
    if (!this.key) await this.initializeKey();
    const combined = base64ToU8(encryptedBase64);
    const iv = combined.slice(0, IV_BYTES);
    const ct = combined.slice(IV_BYTES);
    const ptBuf = await this.subtle.decrypt({ name: "AES-GCM", iv }, this.key!, ct);
    return new TextDecoder().decode(ptBuf);
  }

  /** Auto-clear stored keys after timeout (ms). Default 9 hours */
  autoClearData(timeout?: number) {
    const t = timeout ?? this.autoClearDefault;
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.clearAllData(), t);
  }

  /** Immediately clear key + adapter storage */
  async clearAllData() {
    this.key = null;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    await this.adapter.clearAll();
  }

  /** Optional: allow developer to override storage adapter at runtime */
  setStorageAdapter(adapter: StorageAdapter) {
    this.adapter = adapter;
  }


  async getCurrentKeyBase64(): Promise<string | null> {
    if (!this.key) return null;
    const raw = await this.subtle.exportKey("raw", this.key);
    return bufToBase64(raw);
  }


}
