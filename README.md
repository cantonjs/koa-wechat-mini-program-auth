# koa-wechat-mini-program-auth

[![CircleCI](https://circleci.com/gh/cantonjs/koa-wechat-mini-program-auth.svg?style=shield)](https://circleci.com/gh/cantonjs/koa-wechat-mini-program-auth)
[![Build Status](https://travis-ci.org/cantonjs/koa-wechat-mini-program-auth.svg?branch=master)](https://travis-ci.org/cantonjs/koa-wechat-mini-program-auth)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Low level wechat mini program auth helper for koa middleware

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Reference](#reference)
  - [koaWechatMiniProgramAuth(config)](#koawechatminiprogramauthconfig)
  - [wechatMiniProgram](#wechatminiprogram)
- [License](#license)

## Features

- ✅ Auto decode `rawData` or `encryptedData`
- ✅ Provide method to get `sessionKey` from wechat server
- ❌ Save / cache `sessionKey`
- ❌ Gererate access token
- ❌ Router handler for getting user info or login

## Installation

```bash
yarn add koa-wechat-mini-program-auth
```

## Usage

```js
import Koa from 'koa';
import koaWechatMiniProgramAuth from 'koa-wechat-mini-program-auth';

const app = new Koa();
// ...
app.use(koaWechatMiniProgramAuth({
  appId: '<WECHAT_APP_ID>',
  appSecret: '<WECHAT_APP_SECRET>',
}));
app.use(async (ctx, next) => {
  const { wechatMiniProgramAuth } = ctx.state;

  const userInfo = await wechatMiniProgramAuth.getUserInfo({
    code: '<LOGIN_CODE>'
    rawData: '<RAW_DATA>',
    signature: '<SIGNATURE>',
  });

  // ...
});
// ...
```

## Reference

### koaWechatMiniProgramAuth(config)

Create and inject a [helper object](#wechatminiprogram) to `ctx.state`. Will return a koa middleware.

#### Config

- `appId` \<String\>: Wechat app id, required
- `appSecret` \<String\>: Wechat app secret, required
- `stateKey` \<String\>: Helper key name to `ctx.state`, defaults to `wechatMiniProgram`

### wechatMiniProgram

#### wechatMiniProgram.getUserInfo(params)

##### Params

- `code` \<String\>: `code` from wechat mini program `wx.login()`
- `sessionKey` \<String\>: Session key from `wechatMiniProgram.getSession()`
- `rawData` \<String\>: `rawData` from wechat mini program `wx.getUserInfo()`
- `signature` \<String\>: `signature` from wechat mini program `wx.getUserInfo()`
- `encryptedData` \<String\>: `encryptedData` from wechat mini program `wx.getUserInfo()`
- `iv` \<String\>: `iv` from wechat mini program `wx.getUserInfo()`

###### Note

- One of `code` or `sessionKey` is required
- One of `rawData` and `signature`, or `encryptedData` and `iv` are required

##### Returns

[UserInfo](https://developers.weixin.qq.com/miniprogram/dev/api/open.html#wxgetuserinfoobject) \<String\>

#### wechatMiniProgram.getSession(params)

##### Params

- `code` \<String\>: `code` from wechat mini program `wx.login()`, required

##### Returns

Object containing `sessionKey`, `openid`, `unionid` (optional)

## License

MIT
