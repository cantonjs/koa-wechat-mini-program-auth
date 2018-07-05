import requestSession from './requestSession';
import getUserInfo from './getUserInfo';
import { DEFAULT_HELPER_KEY, LOGIN_URL } from './constants';
import { assert } from './utils';

export default function koaWexappAuth(config = {}) {
	const {
		appId,
		appSecret,
		stateKey = DEFAULT_HELPER_KEY,
		wechatLoginURL = LOGIN_URL, // for test only
	} = config;

	assert(appId, 'Missing "appId"');
	assert(appSecret, 'Missing "appSecret"');

	const helper = {
		async getSession(params = {}) {
			const { code } = params;
			return requestSession(wechatLoginURL, {
				appId,
				appSecret,
				code,
			});
		},
		async getUserInfo(params = {}) {
			const { code, rawData, signature, encryptedData, iv } = params;
			let { sessionKey } = params;
			assert(
				sessionKey || code,
				'Either "code" or "sessionKey" is required to get user info',
			);

			if (!sessionKey) {
				const sessionObj = await requestSession(wechatLoginURL, {
					code,
					appId,
					appSecret,
				});
				sessionKey = sessionObj.sessionKey;
			}

			return getUserInfo({
				rawData,
				signature,
				encryptedData,
				iv,
				appId,
				sessionKey,
			});
		},
	};

	return async function wxappAuthMiddleware(ctx, next) {
		ctx.state[stateKey] = helper;
		await next();
	};
}
