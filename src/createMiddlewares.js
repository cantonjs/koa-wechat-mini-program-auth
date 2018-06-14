import { isFunction } from './utils';

export default function createWechatMiniProgramMiddlewares(config = {}) {
	const {
		stateProp,
		userInfoProp = 'wechatUser',
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
				ctx.body = await ctx.state[stateProp].login(params);
			});
		},
		getUserInfo(options) {
			return createMiddleware(options, async (params, ctx) => {
				ctx.body = await ctx.state[stateProp].getUserInfo(params);
			});
		},
		loginAndGetUserInfo(options) {
			return createMiddleware(options, async (params, ctx) => {
				ctx.body = await ctx.state[stateProp].loginAndGetUserInfo(params);
			});
		},
		auth(options = {}) {
			const prop = options.userInfoProp || userInfoProp;
			return createMiddleware(options, async (params, ctx, next) => {
				const userInfo = await ctx.state[stateProp].loginAndGetUserInfo(params);
				ctx.state[prop] = userInfo;
				await next();
			});
		},
		verify(options) {
			return createMiddleware(options, async (params, ctx, next) => {
				await ctx.state[stateProp].verify(params);
				await next();
			});
		},
	};
}
