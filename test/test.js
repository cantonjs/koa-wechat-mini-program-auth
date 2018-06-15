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

	test('should login() work', async () => {
		const spy = jest.fn(async (ctx, next) => {
			const res = await ctx.state.wechatMiniProgram.login({ code: 'fake' });
			expect(Object.keys(res)).toEqual(['openid']);
			await next();
		});
		await startServer((app, opts) => app.use(auth(opts)).use(spy));
		const response = await request();
		expect(response.ok).toBe(true);
	});

	test('should getUserInfo() with rawData work', async () => {
		const json = { hello: 'world' };
		const rawData = JSON.stringify(json);
		const fakeSessionKey = sessionKey;

		const spy = jest.fn(async (ctx, next) => {
			const res = await ctx.state.wechatMiniProgram.getUserInfo({
				rawData,
				signature: sha1(rawData + fakeSessionKey),
				openid: 'fake',
			});
			expect(res).toEqual(json);
			await next();
		});
		await startServer((app, opts) =>
			app
				.use(
					auth({
						...opts,
						getSessionKey: () => fakeSessionKey,
					}),
				)
				.use(spy),
		);
		const response = await request();
		expect(response.ok).toBe(true);
	});

	test('should getUserInfo() with encryptedData work', async () => {
		const fakeSessionKey = sessionKey;
		const { watermark, ...expectedUserInfo } = decoded;

		const spy = jest.fn(async (ctx, next) => {
			const res = await ctx.state.wechatMiniProgram.getUserInfo({
				iv,
				encryptedData,
				openid: 'fake',
				appId,
			});
			expect(res).toEqual(expectedUserInfo);
			await next();
		});
		await startServer((app, opts) =>
			app
				.use(
					auth({
						...opts,
						getSessionKey: () => fakeSessionKey,
					}),
				)
				.use(spy),
		);
		const response = await request();
		expect(response.ok).toBe(true);
	});

	test('should verify() return true if session key exists', async () => {
		const spy = jest.fn(async (ctx, next) => {
			await ctx.state.wechatMiniProgram.verify({ openid: 'fake' });
			await next();
		});
		await startServer((app, opts) =>
			app
				.use(
					auth({
						...opts,
						getSessionKey: () => sessionKey,
					}),
				)
				.use(spy),
		);
		const response = await request();
		expect(response.ok).toBe(true);
	});

	test('should verify() return false if session key not exists', async () => {
		const spy = jest.fn(async (ctx, next) => {
			await ctx.state.wechatMiniProgram.verify({
				openid: 'fake',
			});
			await next();
		});
		await startServer((app, opts) =>
			app
				.use(
					auth({
						...opts,
						getSessionKey: () => null,
					}),
				)
				.use(spy),
		);
		const response = await request();
		expect(response.ok).toBe(false);
	});
});
