import auth from '../src';
import { sha1 } from '../src/utils';
import { startServer, stopServer, request } from './utils';
import { sessionKey, appId, iv, encryptedData, decoded } from './fixtures';

describe('state.wechatMiniProgram object', () => {
	afterEach(stopServer);

	test('should inject `wechatMiniProgram`', async () => {
		const spy = jest.fn(async (ctx, next) => next());
		await startServer((app, opts) => app.use(auth(opts)).use(spy));
		const response = await request();
		expect(response.ok).toBe(true);
		expect(spy).toHaveBeenLastCalledWith(
			expect.objectContaining({
				state: expect.objectContaining({
					wechatMiniProgram: expect.any(Object),
				}),
			}),
			expect.any(Function),
		);
	});

	test('should getSession() work', async () => {
		const spy = jest.fn(async (ctx, next) => {
			const res = await ctx.state.wechatMiniProgram.getSession({
				code: 'fake',
			});
			expect(Object.keys(res)).toEqual(['openid', 'sessionKey']);
			await next();
		});
		await startServer((app, opts) => app.use(auth(opts)).use(spy));
		const response = await request();
		expect(response.ok).toBe(true);
	});

	test('should getUserInfo() work by code', async () => {
		const json = { hello: 'world' };
		const rawData = JSON.stringify(json);

		const spy = jest.fn(async (ctx, next) => {
			const res = await ctx.state.wechatMiniProgram.getUserInfo({
				rawData,
				signature: sha1(rawData + sessionKey),
				openid: 'fake',
				code: 'fake',
			});
			expect(res).toEqual(json);
			await next();
		});
		await startServer((app, opts) => app.use(auth(opts)).use(spy));
		const response = await request();
		expect(response.ok).toBe(true);
	});

	test('should getUserInfo() with rawData work', async () => {
		const json = { hello: 'world' };
		const rawData = JSON.stringify(json);

		const spy = jest.fn(async (ctx, next) => {
			const res = await ctx.state.wechatMiniProgram.getUserInfo({
				rawData,
				signature: sha1(rawData + sessionKey),
				openid: 'fake',
				sessionKey,
			});
			expect(res).toEqual(json);
			await next();
		});
		await startServer((app, opts) => app.use(auth(opts)).use(spy));
		const response = await request();
		expect(response.ok).toBe(true);
	});

	test('should getUserInfo() with encryptedData work', async () => {
		const { watermark, ...expectedUserInfo } = decoded;

		const spy = jest.fn(async (ctx, next) => {
			const res = await ctx.state.wechatMiniProgram.getUserInfo({
				iv,
				encryptedData,
				openid: 'fake',
				appId,
				sessionKey,
			});
			expect(res).toEqual(expectedUserInfo);
			await next();
		});
		await startServer((app, opts) => app.use(auth(opts)).use(spy));
		const response = await request();
		expect(response.ok).toBe(true);
	});
});
