// 生成 AES-256-CTR 密钥和 Counter，输出为 Base64
// 使用方法: node scripts/genkey.mjs

import { webcrypto } from "node:crypto";

async function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function main() {
    // 生成 AES-256-CTR 密钥
    const key = await webcrypto.subtle.generateKey(
        { name: 'AES-CTR', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // 导出为 raw 格式
    const exported = await webcrypto.subtle.exportKey('raw', key);
    const keyBase64 = await arrayBufferToBase64(exported);

    // 生成 16 字节随机 Counter
    const counter = webcrypto.getRandomValues(new Uint8Array(16));
    const counterBase64 = await arrayBufferToBase64(counter);

    console.log('\n将以下值填入 wrangler.jsonc 的 vars 中:\n');
    console.log(`KEY_BASE64: ${keyBase64}`);
    console.log(`COUNTER_BASE64: ${counterBase64}\n`);
}

main();
