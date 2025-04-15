import { env } from "cloudflare:workers";
import { validDomain } from "./domain";
import redirects from "./redirects";
import { corsHeaders, corsHeadersLite } from "./cors";

type RequestTarget = {
	origin: string;
	path: string;
}

function originOf(request: Request): RequestTarget | null {
	const url = new URL(request.url);
	const forwardTo = request.headers.get(env.FORWARD_HEADER);

	if (forwardTo) {
		if (!validDomain(forwardTo)) return null;
		return {
			origin: forwardTo,
			path: url.pathname
		}
	}

	const [, origin, ...rest] = url.pathname.split("/");
	if (!origin || !validDomain(origin)) return null;

	return {
		origin,
		path: "/" + rest.join("/")
	};
}

function checkRedirects(request: Request) {
	const url = new URL(request.url);
	const cleanPath = url.pathname.endsWith("/")
		? url.pathname.slice(0, -1)
		: url.pathname;

	return Object.entries(redirects).find(([path, location]) => path === cleanPath)?.[1] ?? null
}

async function hitOrigin(request: Request, target: RequestTarget): Promise<Response> {
	const requestHeaders = new Headers(request.headers);

	requestHeaders.delete(env.FORWARD_HEADER);
	requestHeaders.delete("origin");
	requestHeaders.delete("host");

	const url = new URL(`https://${target.origin}${target.path}`);
	let response: Response;
	try {
		response = await fetch(url, {
			method: request.method,
			headers: requestHeaders,
			body: request.body
		})
	} catch (e) {
		console.error("error fetching from origin", e, "when serving for", url.toString())
		return new Response('unable to fetch from origin', {
			status: 502,
			headers: {
				"x-resolved": url.toString(),
				"x-soxy-error": "error fetching from origin: " + String(e),
				...corsHeadersLite,
			}
		})
	}

	const headers = new Headers(response.headers);
	headers.set("x-resolved", url.toString());

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: {
			...headers,
			...corsHeadersLite,
		},
	});
}

export default {
	async fetch(request): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			})
		}

		const origin = originOf(request);
		if (origin) {
			return hitOrigin(request, origin);
		}

		const redirect = checkRedirects(request);
		if (redirect) {
			return new Response(null, {
				status: 307,
				headers: {
					"location": redirect,
					"x-soxy-message": "this was a configured redirect ¯\_(ツ)_/¯",
					"content-length": "0",
					...corsHeadersLite,
				}
			})
		}

		return new Response(env.HELP_MESSAGE, {
			status: 400,
			headers: {
				"x-soxy-warn": "you did not hit any origin or configured redirect, this is a proxy.",
				...corsHeadersLite
			}
		})
	},
} satisfies ExportedHandler<Env>;
