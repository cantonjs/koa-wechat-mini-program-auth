import Koa from 'koa';
import getPort from 'get-port';
import fetch from 'node-fetch';
import { sessionKey, appId } from './fixtures';

let server;
let urlRoot;

const fakeWechatLoginMiddleware = async (ctx, next) => {
	if (ctx.request.path === '/wechat') {
		ctx.body = {
			session_key: sessionKey,
			openid: 'FAKE_OPEN_ID',
		};
		return;
	}
	await next();
};

export async function startServer(setup) {
	const port = await getPort();
	urlRoot = `http://127.0.0.1:${port}`;
	const defaults = {
		wechatLoginURL: `${urlRoot}/wechat`,
		appId,
		appSecret: 'fake',
	};
	const app = new Koa().use(fakeWechatLoginMiddleware);
	setup(app, defaults);
	server = app.use((ctx) => (ctx.body = { ok: false })).listen(port);
}

export async function stopServer() {
	if (server) {
		return new Promise((resolve) => {
			server.close(resolve);
			server = null;
		});
	}
}

export async function request(path = '', options) {
	return fetch(`${urlRoot}${path}`, options);
}
