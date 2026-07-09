import pageHTML from "./page.html";

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// 从环境变量中获取密钥信息
		const keyBase64 = env.KEY_BASE64;
		const counterBase64 = env.COUNTER_BASE64;

		if (!keyBase64 || !counterBase64) {
			return new Response("请配置 KEY_BASE64 和 COUNTER_BASE64 环境变量", { status: 500 });
		}

		// API: 获取密钥信息
		if (url.pathname === "/api/keys") {
			return new Response(JSON.stringify({ keyBase64, counterBase64 }), {
				headers: { "Content-Type": "application/json" },
			});
		}

		// 静态页面
		return new Response(pageHTML, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	},
};
