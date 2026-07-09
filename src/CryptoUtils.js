// ============ 工具函数集合 ============

const CryptoUtils = {
    // ArrayBuffer → Base64
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    // Base64 → ArrayBuffer
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    },

    // 生成CTR密钥
    async generateCTRKey() {
        const key = await crypto.subtle.generateKey(
            { name: 'AES-CTR', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        const exported = await crypto.subtle.exportKey('raw', key);
        const counter = crypto.getRandomValues(new Uint8Array(16));

        return {
            cryptoKey: key,
            keyBase64: this.arrayBufferToBase64(exported),
            counterBase64: this.arrayBufferToBase64(counter)
        };
    },

    // 导入CTR密钥
    async importCTRKey(keyBase64) {
        const keyData = this.base64ToArrayBuffer(keyBase64);
        return await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-CTR' },
            false,
            ['encrypt', 'decrypt']
        );
    },

    // CTR加密
    async encryptCTR(data, keyBase64, counterBase64) {
        const cryptoKey = await this.importCTRKey(keyBase64);
        const counter = this.base64ToArrayBuffer(counterBase64);

        return await crypto.subtle.encrypt(
            {
                name: 'AES-CTR',
                counter: counter,
                length: 64
            },
            cryptoKey,
            data
        );
    },

    // CTR解密
    async decryptCTR(encryptedData, keyBase64, counterBase64) {
        const cryptoKey = await this.importCTRKey(keyBase64);
        const counter = this.base64ToArrayBuffer(counterBase64);

        return await crypto.subtle.decrypt(
            {
                name: 'AES-CTR',
                counter: counter,
                length: 64
            },
            cryptoKey,
            encryptedData
        );
    },

    // 验证密钥
    async verifyKey(keyBase64) {
        try {
            await this.importCTRKey(keyBase64);
            return true;
        } catch {
            return false;
        }
    }
};

export default CryptoUtils;

/* 

// ============ 使用示例 ============

// 1. 生成密钥
const { keyBase64, counterBase64 } = await CryptoUtils.generateCTRKey();
console.log('密钥(Base64):', keyBase64);
console.log('Counter(Base64):', counterBase64);

// 2. 加密数据
const data = new TextEncoder().encode('Hello World');

// 3. 执行加密
const encryptedData = await CryptoUtils.encryptCTR(
    data,
    keyBase64,
    counterBase64
);
console.log('加密后的数据:', encryptedData);
console.log('加密后长度:', encryptedData.byteLength); // 11字节（长度不变！）

// 4. 执行解密
const decryptedData = await CryptoUtils.decryptCTR(
    encryptedData,
    keyBase64,
    counterBase64
);
console.log('解密后的数据:', new TextDecoder().decode(decryptedData)); // Hello World

// 5. 验证
console.log('加密成功:', new TextDecoder().decode(decryptedData) === 'Hello World');

*/