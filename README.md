# Simple File Encryption

基于 Cloudflare Workers 的文件头尾加解密工具，使用 AES-256-CTR 算法。

## 原理

只加解密文件的**前 100 字节**和**后 100 字节**，中间部分保持不变。这样即使是大文件也能快速处理，不会阻塞。

使用 AES-256-CTR 流加密模式，加密和解密是同一个操作——执行两次即还原。

## 架构

```
浏览器（File System Access API）        Cloudflare Worker
┌─────────────────────────┐      POST /api/crypto     ┌──────────────────┐
│ 读取文件头尾 100 字节      │ ───── Base64 ──────────→  │ AES-CTR 加解密    │
│ ↓                       │                           │ ↓                │
│ 写回加密后的头尾           │ ←──── Base64 ───────────  │ 返回结果          │
└─────────────────────────┘                           └──────────────────┘
```

- 密钥存储在 Worker 环境变量中，浏览器无法接触
- 仅传输头尾共最多 200 字节，不传输整个文件

## 快速开始

```bash
# 安装依赖
npm install

# 生成密钥（将输出填入 wrangler.jsonc 的 vars 中）
npm run genkey

# 本地开发
npm run dev

# 部署到 Cloudflare
npm run deploy
```

## 环境变量

在 `wrangler.jsonc` 的 `vars` 中配置，或通过 `wrangler secret` 设置：

| 变量 | 说明 |
|------|------|
| `KEY_BASE64` | AES-256 密钥（Base64） |
| `COUNTER_BASE64` | CTR 模式初始计数器（16 字节、Base64） |

## 使用方法

1. 部署后打开 Worker 页面
2. 点击选择目录，授权文件系统访问
3. 文件列表中点击「加解密」按钮
4. 首次点击加密，再次点击解密还原

## 注意事项

- 需 HTTPS 或 localhost 环境（File System Access API 要求）
- 加解密前请关闭被其他程序占用的文件（如 PDF 预览），否则会读取超时
- 隐藏文件（`.` 开头）不会被列出


## 📄 License

MIT © [hairow]

---

> 💡 如果这个项目对你有帮助，欢迎 Star ⭐ 和捐赠支持！

## ☕ 捐赠支持

如果这个插件帮你省了时间，欢迎请我喝杯咖啡~

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./images/alipay-qr.webp" width="200" alt="支付宝收款码"><br>
        <b>支付宝</b>
      </td>
    </tr>
  </table>
</div>
