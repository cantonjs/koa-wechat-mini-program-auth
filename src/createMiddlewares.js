import { isFunction } from './utils';

export default function createWechatMiniProgramMiddlewares(config = {}) {
	const {
		stateProp,
		userInfoProp = 'wechatUser',
		getParams = (ctx) => ctx.params.body,
		interceptError,
	} = config;

	const tryRun = async function tryRun(ctx, fn) {
		try {
			return await fn();
		}
		catch (err) {
			const error = isFunction(interceptError) ? interceptError(err) : err;
			if (error) {
				const { statusCode = 401, message = 'Unauthorized' } = error;
				ctx.throw(statusCode, message);
			}
		}
	};

	return {
		async login(ctx) {
			await tryRun(ctx, async () => {
				ctx.body = await ctx.state[stateProp].login(ctx.params.body);
			});
		},
		async getUserInfo(ctx) {
			await tryRun(ctx, async () => {
				ctx.body = await ctx.state[stateProp].getUserInfo(ctx.query);
			});
		},
		async loginAndGetUserInfo(ctx) {
			await tryRun(ctx, async () => {
				ctx.body = await ctx.state[stateProp].loginAndGetUserInfo(
					ctx.params.body,
				);
			});
		},
		async auth(ctx, next) {
			await tryRun(ctx, async () => {
				const params = getParams(ctx);
				const userInfo = await ctx.state[stateProp].loginAndGetUserInfo(params);
				ctx.state[userInfoProp] = userInfo;
				await next();
			});
		},
		async verify(ctx, next) {
			await tryRun(ctx, async () => {
				const params = getParams(ctx);
				await ctx.state[stateProp].verify(params);
				await next();
			});
		},
	};
}
