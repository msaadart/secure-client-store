import { SecureStore } from "./secureStore";

async function testSecureStore() {
  const base64Key = "WbQ8bpBs2+8+eOmzsWc08AWr1nTcnuUUzv5h9RobgYE=";

  // Pass userKey
  const store = new SecureStore({ userKey: base64Key });
  await store.initializeKey();

  const encrypted = await store.encrypt("hello");
  const decrypted = await store.decrypt(encrypted);

  console.log("Decrypted matches:", decrypted === "hello");

  // Debug - export current key from memory
  const raw = await crypto.subtle.exportKey("raw", (store as any).key);
  const usedKey = btoa(String.fromCharCode(...new Uint8Array(raw)));

  console.log("User key used:", usedKey , base64Key);
}

testSecureStore();




