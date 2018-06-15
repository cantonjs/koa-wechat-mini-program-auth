import crypto from 'crypto';
import nativeAssert from 'assert';
import cache from './NOT_RECOMMENDED_cache';
import { name } from '../package.json';

export const assert = (val, msg) => nativeAssert(val, `[${name}] ${msg}`);
export const warn = (...msg) => console.warn(`[${name}]`, ...msg);

export const isString = (s) => typeof s === 'string';
export const isObject = (o) => typeof o === 'object';
export const isFunction = (f) => typeof f === 'function';

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

export const sha1 = (str) =>
	crypto
		.createHash('sha1')
		.update(str)
		.digest('hex');
