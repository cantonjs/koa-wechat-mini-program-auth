import createWechatMiniProgramHelper from './createHelper';

export default function createWechatMiniProgramMiddleware(config = {}) {
	const { stateProp = 'wechatMiniProgram' } = config;
	const wechatMiniProgramHelper = createWechatMiniProgramHelper(config);
	return async function wechatMiniProgramAuthMiddleware(ctx, next) {
		ctx.state[stateProp] = wechatMiniProgramHelper;
		await next();
	};
}
