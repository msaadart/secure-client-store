# secure-client-store

**Universal TypeScript library for AES-256-GCM client-side encryption** — works seamlessly in **Browsers** and **Node.js**.  
Compatible with **React**, **Vue**, and **Angular**.  
Ideal for securely storing sensitive client-side data.

---

## 🚀 Features

- 🔐 **AES-256-GCM encryption** for strong, modern security  
- 🌐 Works in both **Browser** and **Node.js** environments  
- ⚙️ **Framework-agnostic** — use with React, Vue, Angular, or Vanilla JS  
- ⏳ **Auto-clear feature** to remove data after a defined duration  
- 🧩 Simple API methods: `initializeKey`, `encrypt`, `decrypt`

---

## 📦 Installation

```bash
npm install secure-client-store
```

---

## 🧠 Usage Examples

### Default behavior (auto-generate + store key)
```ts
const store = new SecureStore();
await store.initializeKey();

const encrypted = await store.encrypt("secret");
const decrypted = await store.decrypt(encrypted);
```

---

### With custom user-provided key
```ts
// Must be a 256-bit (32-byte) base64 string
const myKey = "aW5zZWN1cmVfMzJfYnl0ZV9iYXNlNjRfZGF0YQ==";

const store = new SecureStore({ userKey: myKey });
await store.initializeKey();

const encrypted = await store.encrypt("secret");
const decrypted = await store.decrypt(encrypted);
```

---

### React (Functional Component)
```tsx
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

---

### Vue 3 (Composition API)
```js
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

---

### Angular (Service)
```ts
import { Injectable } from "@angular/core";
import { SecureStore } from "secure-client-store";

@Injectable({ providedIn: "root" })
export class SecureService {
  private store = new SecureStore();

  async init() {
    await this.store.initializeKey();
  }

  encrypt(text: string) {
    return this.store.encrypt(text);
  }

  decrypt(ct: string) {
    return this.store.decrypt(ct);
  }
}
```

---

## 💖 Support This Project

If you find **secure-client-store** useful, please consider supporting my work 🙌  

🌍 **Payoneer:** [Send via Payoneer](https://app.payoneer.com/onlinepayment?t=5685D054F4D14978BABA420CC3C0F70D&src=prqLink)

```
Payoneer Customer ID: 56133568
```

**Bank Details:**
```
Bank Name:        Citibank  
Bank Address:     111 Wall Street, New York, NY 10043, USA  
Routing (ABA):    031100209  
SWIFT Code:       CITIUS33  
Account Number:   70580680002068111  
Account Type:     CHECKING  
Beneficiary Name: MUHAMMAD SAAD NASIR
```


