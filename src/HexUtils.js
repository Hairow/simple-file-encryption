// ============ 16进制工具集合 ============

const HexUtils = {
    // ArrayBuffer → 16进制字符串
    arrayBufferToHex(buffer) {
        const bytes = new Uint8Array(buffer);
        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
            hex += bytes[i].toString(16).padStart(2, '0');
        }
        return hex;
    },

    // 16进制字符串 → ArrayBuffer
    hexToArrayBuffer(hex) {
        if (hex.length % 2 !== 0) {
            throw new Error('Invalid hex string');
        }
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes.buffer;
    },

    // 16进制字符串 → Uint8Array
    hexToUint8Array(hex) {
        return new Uint8Array(this.hexToArrayBuffer(hex));
    },

    // 验证是否为有效的16进制
    isValidHex(hex) {
        return /^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0;
    },

    // 格式化显示（每8字节空格）
    formatHex(buffer, groupSize = 8) {
        const hex = this.arrayBufferToHex(buffer);
        const groups = [];
        for (let i = 0; i < hex.length; i += groupSize * 2) {
            groups.push(hex.substr(i, groupSize * 2));
        }
        return groups.join(' ');
    }
};

export default HexUtils;