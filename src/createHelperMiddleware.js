import requestLogin from './requestLogin';
import getUserInfo from './getUserInfo';
import {
	isObject,
	defaultSign,
	defaultVerifySign,
	defaultGetSessionKey,
	defaultSetSessionKey,
} from './utils';

export default function createWechatMiniProgramMiddleware(config = {}) {
	const {
		appId,
		appSecret,
		sign = defaultSign,
		verifySign = defaultVerifySign,
		setSessionKey = defaultGetSessionKey,
		getSessionKey = defaultSetSessionKey,
		stateProp = 'wechatMiniProgram',
	} = config;

	const applyLogin = async function applyLogin(params = {}) {
		const { code } = params;
		const { openid, unionid, sessionKey } = await requestLogin({
			appId,
			appSecret,
			code,
		});
		await setSessionKey({ openid, unionid, sessionKey });
		const res = await sign(openid, unionid);
		return {
			res: isObject(res) ? res : { accessToken: res },
			sessionKey,
		};
	};

	const verify = async function verify(params) {
		const id = await verifySign(params);
		const sessionKey = await getSessionKey(id);
		if (!sessionKey) {
			throw new Error('Illegal Session Key');
		}
	};

	const helper = {
		async login(params = {}) {
			const { res } = await applyLogin(params);
			return res;
		},
		async getUserInfo(params = {}) {
			const sessionKey = await verify(params);
			const { rawData, signature, encryptedData, iv } = params;
			return getUserInfo({
				rawData,
				signature,
				encryptedData,
				iv,
				appId,
				sessionKey,
			});
		},
		async loginAndGetUserInfo(params = {}) {
			const { res, sessionKey } = await applyLogin(params);
			const userInfo = getUserInfo({ ...params, sessionKey });
			return { ...res, userInfo };
		},
		async verify(params = {}) {
			const sessionKey = await verify(params);
			return !!sessionKey;
		},
	};

	return async function wechatMiniProgramAuthMiddleware(ctx, next) {
		ctx.state[stateProp] = helper;
		await next();
	};
}
