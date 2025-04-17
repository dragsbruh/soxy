# soxy

soxy is a fast proxy that runs as a cloudflare worker. the main goal is speed.

_(erm i say that but while it may not be super fast, its fast enough. please contribute to make it go faster!)_

## usage

### deployment

as i said, soxy works on a cloudflare worker, you can smash this button to deploy this worker yourself!

[![deploy to cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dragsbruh/soxy)

or see [advanced deployment](#advanced-deployment)

_whoops, the deploy button didnt work till now, it should now work tho, hopefully_

### basic usage

there are two methods of using soxy to proxy:

#### 1. the header way (recommended)

target origin is specified in the `x-forward-to` header.

**ex**: to send a request to `https://nicememe.com/pepefunny/post.html`:

use these headers:

```
x-forward-to: nicememe.com
```

and send request to:

```
https://soxy.dragsbruh.workers.dev/pepefunny/post.html
```

this is my preferred way of using soxy in my projects as i can easily swap between soxy and not soxy.

#### 2. the path way

this method only exists to support using soxy in browser. if both methods are used to specify path, the header way takes precedence.

in this method, you specify the path as the first path component.

**ex**: to send a request to `https://nicememe.com/pepefunny/post.html`:

you send a request to

```
https://soxy.dragsbruh.workers.dev/nicememe.com/pepefunny/post.html
```

### advanced usage

soxy does not send a 1:1 copy of your requests to your origin and responses, it modifies the headers a bit.

1. it removes these headers (necessary)

```ts
requestheaders.delete('origin');
requestheaders.delete('host');
```

2. it removes these soxy specific headers

```ts
requestheaders.delete(env.forward_header); // "x-forward-to" by default.
```

3. it adds these headers

```ts
// this is the final url that the request was sent to
headers.set('x-resolved', url.tostring());

// optional: if there was an error in soxy
headers.set('x-soxy-error', '...');

// optional: if there was an error in your request
headers.set('x-soxy-warn', '...');

// optional: if there was a soxy redirect
headers.set('x-soxy-message', '...');
```

### advanced deployment

please deploy soxy yourself for production, the public instance runs on free tier and is only meant for development.

1. to configure custom redirects, see [redirects.ts](./src/redirects.ts).
2. to configure the default 400 message or `x-forward-to` header, see [wrangler.toml](./wrangler.toml)

## development

the domain validation is fast, but not good. it takes 5 microseconds and validates only basic domain syntax but it might fail to validate invalid domains.
its not soxy's fault user sends wrong domains tho `¯\_(ツ)_/¯`

### todo

- [ ] cors

## pro-tip (self-promotion)

this file was post-processed using [lcase](https://github.com/dragsbruh/lcase)! the best file lowercaser tool!
