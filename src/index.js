import pageHTML from "./page.html";
import CryptoUtils from "./CryptoUtils";

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// 从环境变量中获取密钥信息
		const keyBase64 = env.KEY_BASE64;
		const counterBase64 = env.COUNTER_BASE64;

		if (!keyBase64 || !counterBase64) {
			return new Response("请配置 KEY_BASE64 和 COUNTER_BASE64 环境变量", { status: 500 });
		}

		// API: 加解密 
		if (url.pathname === "/api/crypto" && request.method === "POST") {
			try {
				const body = await request.json();
				const { head, tail } = body;

				const headArrayBuf = CryptoUtils.base64ToArrayBuffer(head);
				let encryptedHead = await CryptoUtils.encryptCTR(headArrayBuf, keyBase64, counterBase64);
				encryptedHead = CryptoUtils.arrayBufferToBase64(encryptedHead)

				let encryptedTail = null;
				if (tail) {
					const tailArrayBuf = CryptoUtils.base64ToArrayBuffer(tail);
					encryptedTail = await CryptoUtils.encryptCTR(tailArrayBuf, keyBase64, counterBase64);
					encryptedTail = CryptoUtils.arrayBufferToBase64(encryptedTail);
				}

				return new Response(JSON.stringify({
					head: encryptedHead,
					tail: encryptedTail
				}), {
					headers: { "Content-Type": "application/json" },
				});
			} catch (err) {
				return new Response(JSON.stringify({ error: err.message }), {
					status: 500,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// API:获取用户IP
		if (url.pathname === '/api/getIP') {
			const { cf } = request;
			const data = {
				ip: request.headers.get('cf-connecting-ip'),
				country: cf?.country,
				city: cf?.city,
				region: cf?.region,
				latitude: cf?.latitude,
				longitude: cf?.longitude,
				asn: cf?.asn,
				isp: cf?.asOrganization,
			};

			return new Response(JSON.stringify(data, null, 2), {
				headers: { 'content-type': 'application/json;charset=UTF-8' },
			});
		}

		// 静态页面
		return new Response(pageHTML, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	},
};
