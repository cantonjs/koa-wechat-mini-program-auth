import cache from './NOT_RECOMMENDED_cache';

export const isObject = (o) => typeof o === 'object';

export const defaultSign = (openid) => ({ openid });

export const defaultVerifySign = ({ openid }) => {
	if (!openid) {
		throw new Error('Illegal Access Token');
	}
	return openid;
};

export const defaultGetSessionKey = (openid) => cache.get(openid);

export const defaultSetSessionKey = ({ openid, sessionKey }) => {
	cache.set(openid, sessionKey);
};
