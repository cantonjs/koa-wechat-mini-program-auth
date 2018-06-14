import requestLogin from './requestLogin';
import getUserInfo from './getUserInfo';
import {
	isObject,
	defaultSign,
	defaultVerifySign,
	defaultGetSessionKey,
	defaultSetSessionKey,
} from './utils';

export default function createWechatMiniProgramHelper(config = {}) {
	const {
		appId,
		appSecret,
		sign = defaultSign,
		verifySign = defaultVerifySign,
		setSessionKey = defaultGetSessionKey,
		getSessionKey = defaultSetSessionKey,
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

	const tryRun = async function tryRun(fn) {
		try {
			return await fn();
		}
		catch (err) {

			// TODO: handle error
			console.error(err);
			return err;
		}
	};

	return {
		async login(params = {}) {
			return tryRun(async function tryToLogin() {
				const { res } = await applyLogin(params);
				return res;
			});
		},
		async getUserInfo(params = {}) {
			return tryRun(async function tryToGetUserInfo() {
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
			});
		},
		async loginAndGetUserInfo(params = {}) {
			return tryRun(async function tryToLoginAndGetUserInfo() {
				const { res, sessionKey } = await applyLogin(params);
				const userInfo = getUserInfo({ ...params, sessionKey });
				return { ...res, userInfo };
			});
		},
		async verify(params = {}) {
			const sessionKey = await verify(params);
			return !!sessionKey;
		},
	};
}
