import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Convertit un ArrayBuffer en Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Convertit un Base64 en ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};

// Génère une paire de clés RSA
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const keyPair = await webcrypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

// Exporte une clé publique en Base64
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

// Exporte une clé privée en Base64
export async function exportPrvKey(
  key: webcrypto.CryptoKey | null
): Promise<string | null> {
  if (!key) return null;
  const exported = await webcrypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported);
}

// Importe une clé publique à partir d'une chaîne Base64
export async function importPubKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(strKey),
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

// Importe une clé privée à partir d'une chaîne Base64
export async function importPrvKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(strKey),
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

// Chiffre un message avec une clé publique RSA
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  const publicKey = await importPubKey(strPublicKey);
  const encrypted = await webcrypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    Buffer.from(b64Data, "base64")
  );
  return arrayBufferToBase64(encrypted);
}

// Déchiffre un message avec une clé privée RSA
export async function rsaDecrypt(
  data: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  const decrypted = await webcrypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    base64ToArrayBuffer(data)
  );
  return Buffer.from(decrypted).toString("utf8");
}

// ######################
// ### Symmetric keys ###
// ######################

// Génère une clé symétrique aléatoire AES-256
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.generateKey(
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Exporte une clé symétrique en Base64
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

// Importe une clé symétrique à partir d'une chaîne Base64
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.importKey(
    "raw",
    base64ToArrayBuffer(strKey),
    { name: "AES-CBC" },
    true,
    ["encrypt", "decrypt"]
  );
}

// Chiffre un message avec une clé symétrique AES-256
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
  const iv = webcrypto.getRandomValues(new Uint8Array(16));
  const encrypted = await webcrypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    new TextEncoder().encode(data)
  );

  return arrayBufferToBase64(iv) + ":" + arrayBufferToBase64(encrypted);
}

// Déchiffre un message avec une clé symétrique AES-256
export async function symDecrypt(
  strKey: string,
  encryptedData: string
): Promise<string> {
  const [ivBase64, dataBase64] = encryptedData.split(":");
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const key = await importSymKey(strKey);

  const decrypted = await webcrypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    base64ToArrayBuffer(dataBase64)
  );

  return new TextDecoder().decode(decrypted);
}
