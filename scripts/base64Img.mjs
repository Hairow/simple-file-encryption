// 将图片文件压缩后转为 Base64 Data URI，输出到 txt 文件
// 使用方法: node scripts/base64Img.mjs <图片路径>
//   例: node scripts/base64Img.mjs ./test.png                            默认压缩后输出 data URI
//   例: node scripts/base64Img.mjs ./test.png -w 400 -q 60               宽 400px，质量 60%
//   例: node scripts/base64Img.mjs ./test.png --format png -w 200         输出 PNG
//   例: node scripts/base64Img.mjs ./test.png --raw -o out.txt             纯 Base64

import { readFileSync, writeFileSync } from "node:fs";
import { extname, basename } from "node:path";
import sharp from "sharp";

function parseArg(args, flag, fallback, parse = Number) {
    const i = args.indexOf(flag);
    return i !== -1 && i + 1 < args.length ? parse(args[i + 1]) : fallback;
}

function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('用法: node scripts/base64Img.mjs <图片路径> [-w 宽度] [-q 质量] [--format webp|png|jpeg] [--raw] [-o 输出文件]');
        console.log('  默认: 最大宽度 800px, 质量 80, 格式 webp');
        process.exit(1);
    }

    const imgPath = args[0];
    const rawMode = args.includes('--raw');
    const maxWidth = parseArg(args, '-w', 800);
    const quality = parseArg(args, '-q', 80);
    const format = parseArg(args, '--format', 'webp', String);

    const imgBase = basename(imgPath, extname(imgPath));

    const oIdx = args.indexOf('-o');
    const outPath = oIdx !== -1 && oIdx + 1 < args.length
        ? args[oIdx + 1]
        : imgBase + '.txt';

    const imgOutPath = imgBase + '_compressed.' + format;

    let inputBuf;
    try {
        inputBuf = readFileSync(imgPath);
    } catch (err) {
        console.error(`无法读取文件: ${imgPath}`);
        console.error(err.message);
        process.exit(1);
    }

    const originalKB = (inputBuf.length / 1024).toFixed(1);

    // sharp 压缩 + 缩放
    const pipeline = sharp(inputBuf)
        .resize({ width: maxWidth, height: 400, fit: 'inside', withoutEnlargement: true })
    [format]({ quality });

    pipeline.toBuffer().then(compressedBuf => {
        const compressedKB = (compressedBuf.length / 1024).toFixed(1);
        const base64 = compressedBuf.toString('base64');

        const mimeMap = { webp: 'image/webp', png: 'image/png', jpeg: 'image/jpeg' };
        const content = rawMode
            ? base64
            : `data:${mimeMap[format]};base64,${base64}`;

        writeFileSync(outPath, content, 'utf-8');
        writeFileSync(imgOutPath, compressedBuf);
        console.log(`原始: ${originalKB} KB → 压缩后: ${compressedKB} KB (${format}, ${maxWidth}px, q${quality}) → Base64: ${(content.length / 1024).toFixed(1)} KB`);
        console.log(`已写入: ${outPath}`);
        console.log(`已写入: ${imgOutPath}`);
    }).catch(err => {
        // 非图片文件 fallback 到原始逻辑
        const base64 = inputBuf.toString('base64');
        const ext = extname(imgPath).toLowerCase();
        const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp', '.svg': 'image/svg+xml' };
        const mime = mimeMap[ext] || 'application/octet-stream';
        const content = rawMode ? base64 : `data:${mime};base64,${base64}`;
        writeFileSync(outPath, content, 'utf-8');
        console.log(`压缩失败（${err.message}），输出原始文件: ${outPath} (${(content.length / 1024).toFixed(1)} KB)`);
    });
}

main();
