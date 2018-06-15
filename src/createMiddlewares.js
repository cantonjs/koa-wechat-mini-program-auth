import { DEFAULT_HELPER_KEY, DEFAULT_USER_KEY } from './constants';
import { isFunction } from './utils';

export default function createWechatMiniProgramMiddlewares(config = {}) {
	const {
		stateKey = DEFAULT_HELPER_KEY,
		userInfoKey = DEFAULT_USER_KEY,
		mapParams = (ctx) => ctx.params.body,
		interceptError,
	} = config;

	const createMiddleware = async function createMiddleware(
		options = {},
		handle,
	) {
		return async function middleware(ctx, next) {
			try {
				const params = (options.mapParams || mapParams)(ctx);
				return await handle(params, ctx, next);
			}
			catch (err) {
				const error = isFunction(interceptError) ? interceptError(err) : err;
				if (error) {
					const { statusCode = 401, message = 'Unauthorized' } = error;
					ctx.throw(statusCode, message);
				}
			}
		};
	};

	return {
		login(options) {
			return createMiddleware(options, async (params, ctx) => {
				ctx.body = await ctx.state[stateKey].login(params);
			});
		},
		getUserInfo(options) {
			return createMiddleware(options, async (params, ctx) => {
				ctx.body = await ctx.state[stateKey].getUserInfo(params);
			});
		},
		loginAndGetUserInfo(options) {
			return createMiddleware(options, async (params, ctx) => {
				ctx.body = await ctx.state[stateKey].loginAndGetUserInfo(params);
			});
		},
		auth(options = {}) {
			const key = options.userInfoKey || userInfoKey;
			return createMiddleware(options, async (params, ctx, next) => {
				const userInfo = await ctx.state[stateKey].loginAndGetUserInfo(params);
				ctx.state[key] = userInfo;
				await next();
			});
		},
		verify(options) {
			return createMiddleware(options, async (params, ctx, next) => {
				await ctx.state[stateKey].verify(params);
				await next();
			});
		},
	};
}
