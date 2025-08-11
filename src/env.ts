// src/env.ts
export const isBrowser = typeof window !== "undefined" && typeof window.crypto !== "undefined";

export function getSubtleCrypto(): SubtleCrypto {
  // prefer globalThis.crypto.subtle (browser or Node >= 18's global webcrypto)
  // Node 16-18 may require: (require('crypto').webcrypto).subtle
  if ((globalThis as any).crypto && (globalThis as any).crypto.subtle) {
    return (globalThis as any).crypto.subtle as SubtleCrypto;
  }

  // Attempt to require Node's crypto.webcrypto
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require("crypto");
    if (nodeCrypto && nodeCrypto.webcrypto && nodeCrypto.webcrypto.subtle) {
      return nodeCrypto.webcrypto.subtle as SubtleCrypto;
    }
  } catch (e) {
    // not Node or unavailable
  }

  throw new Error("No Web Crypto API available in this environment. Use Node >= 18 or provide a polyfill.");
}
