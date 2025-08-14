# secure-client-store

**Universal TypeScript library for AES-256-GCM client-side encryption** (works in **Browsers** & **Node.js**).  
Compatible with **React**, **Vue**, and **Angular**.  
Perfect for securely storing sensitive client-side data.

---

##  Features

- **AES-256-GCM encryption** for strong security.
- Works in both **browser** and **Node.js** environments.
- **Framework-agnostic** — use with React, Vue, Angular, or plain JS.
- **Auto-clear** feature to remove stored data after a set duration.
- Easy API: `initializeKey`, `encrypt`, `decrypt`.

---

## 📦 Installation

```bash
npm install secure-client-store

```
## Default behavior (auto-generate + store key)
```
const store = new SecureStore();
await store.initializeKey();
const encrypted = await store.encrypt("secret");

```
## With custom user-provided key
```
// Must be a 256-bit (32-byte) base64 string
const myKey = "aW5zZWN1cmVfMzJfYnl0ZV9iYXNlNjRfZGF0YQ==";

const store = new SecureStore({ userKey: myKey });
await store.initializeKey();
const encrypted = await store.encrypt("secret");
```

## React (functional component)
```
import React, { useEffect, useState } from "react";
import { SecureStore } from "secure-client-store";

const store = new SecureStore();

export default function App() {
  const [crypted, setCrypted] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      await store.initializeKey();
      const c = await store.encrypt("secret from React");
      setCrypted(c);
    })();
    store.autoClearData(1000 * 60 * 60); // 1 hour
  }, []);

  return <div>{crypted}</div>;
}
```

## Vue 3 (composition API)
```
import { ref, onMounted } from "vue";
import { SecureStore } from "secure-client-store";

const store = new SecureStore();

export default {
  setup() {
    const data = ref("");
    onMounted(async () => {
      await store.initializeKey();
      data.value = await store.encrypt("vue secret");
    });
    return { data };
  }
};
```

## Angular (service)
```
import { Injectable } from "@angular/core";
import { SecureStore } from "secure-client-store";

@Injectable({ providedIn: "root" })
export class SecureService {
  private store = new SecureStore();
  async init() { await this.store.initializeKey(); }
  encrypt(text: string) { return this.store.encrypt(text); }
  decrypt(ct: string) { return this.store.decrypt(ct); }
}
```