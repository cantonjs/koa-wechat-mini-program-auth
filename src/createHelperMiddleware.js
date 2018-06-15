import requestLogin from './requestLogin';
import getUserInfo from './getUserInfo';
import { DEFAULT_HELPER_KEY, LOGIN_URL } from './constants';
import {
	assert,
	warn,
	isObject,
	isFunction,
	defaultSign,
	defaultVerifySign,
	defaultGetSessionKey,
	defaultSetSessionKey,
} from './utils';

export default function createWechatMiniProgramMiddleware(config = {}) {
	const {
		appId,
		appSecret,
		stateKey = DEFAULT_HELPER_KEY,
		wechatLoginURL = LOGIN_URL,
	} = config;

	assert(appId, 'Missing "appId"');
	assert(appSecret, 'Missing "appSecret"');

	const warnings = [];
	const defaults = (name, fallback) => {
		if (isFunction(config[name])) return config[name];
		warnings.push(name);
		return fallback;
	};

	const sign = defaults('sign', defaultSign);
	const verifySign = defaults('verifySign', defaultVerifySign);
	const setSessionKey = defaults('setSessionKey', defaultSetSessionKey);
	const getSessionKey = defaults('getSessionKey', defaultGetSessionKey);

	if (warnings.length) {
		const missingProps = warnings.map((n) => `"${n}()"`).join(', ');
		warn(`It's highly recommended to set custom ${missingProps}`);
	}

	const applyLogin = async function applyLogin(params = {}) {
		const { code } = params;
		assert(code, 'Missing "code"');
		const { openid, unionid, sessionKey } = await requestLogin(wechatLoginURL, {
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
		ctx.state[stateKey] = helper;
		await next();
	};
}
