import crypto from 'crypto';

const cryptoSha1 = function cryptoSha1(str) {
	return crypto
		.createHash('sha1')
		.update(str)
		.digest('hex');
};

export default function parseRawData({ rawData, signature, sessionKey }) {
	const sha1 = cryptoSha1(rawData + sessionKey);
	if (signature !== sha1) {
		throw new Error('Illegal Signature');
	}
	return JSON.parse(rawData);
}
