import { LOGIN_URL } from './constants';
import qs from 'querystring';
import fetch from 'node-fetch';

export default async function requestLogin({ appId, appSecret, code }) {
	const query = qs.stringify({
		appid: appId,
		secret: appSecret,
		js_code: code,
		grant_type: 'authorization_code',
	});
	const url = `${LOGIN_URL}?${query}`;
	const res = await fetch(url);
	const { errcode, errmsg, ...rest } = await res.json();
	if (errcode) {
		const err = new Error(errmsg);
		err.code = errcode;
		throw err;
	}
	res.sessionKey = res.session_key;
	return rest;
}
