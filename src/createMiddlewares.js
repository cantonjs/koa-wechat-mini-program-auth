export default function createWechatMiniProgramMiddlewares(config = {}) {
	const {
		stateProp,
		userStateProp = 'wechatUser',
		getParams = (ctx) => ctx.params.body,
	} = config;

	const callHelper = async function callHelper(method, ctx, next, params) {
		const res = await ctx.state[stateProp][method](params);
		if (res instanceof Error) {
			const { statusCode = 401, message = 'Unauthorized' } = res;
			ctx.throw(statusCode, message);
		}
		else {
			ctx.body = res;
		}
	};

	return {
		async login(ctx, next) {
			await callHelper('login', ctx, next, ctx.params.body);
		},
		async getUserInfo(ctx, next) {
			await callHelper('getUserInfo', ctx, next, ctx.query);
		},
		async loginAndGetUserInfo(ctx, next) {
			await callHelper('loginAndGetUserInfo', ctx, next, ctx.params.body);
		},
		async auth(ctx, next) {
			const params = getParams(ctx);
			const res = await ctx.state[stateProp].loginAndGetUserInfo(params);
			if (res instanceof Error) {
				const { statusCode = 401, message = 'Unauthorized' } = res;
				ctx.throw(statusCode, message);
			}
			else {
				ctx.state[userStateProp] = res;
				await next();
			}
		},

		// TODO: error handler
		async verify(ctx, next) {
			try {
				const params = getParams(ctx);
				await ctx.state[stateProp].verify(params);
				await next();
			}
			catch (err) {
				const { statusCode = 401, message = 'Unauthorized' } = err;
				ctx.throw(statusCode, message);
			}
		},
	};
}
