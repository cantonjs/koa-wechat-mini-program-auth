import createHelperMiddleware from './createHelperMiddleware';
import createWechatMiniProgramMiddlewares from './createMiddlewares';

export default function wechatMiniProgramAuth(config = {}) {
	const middleware = createHelperMiddleware(config);
	Object.assign(middleware, createWechatMiniProgramMiddlewares(config));
	return middleware;
}
