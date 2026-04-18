import { pageNotFound, corsHeadersFull, corsHeadersLite } from "./config";

const FORWARD_HEADER_NAME = "X-Forward-To";

type Destination = {
	type: "proxy" | "redirect";
	location: string;
};

function extractDestination(request: Request): Destination | null {
	const hdr = request.headers.get(FORWARD_HEADER_NAME);
	if (hdr) return { "type": "proxy", "location": hdr };

	const url = new URL(request.url);

	if (url.pathname == "/") {
		const proxyParam = url.searchParams.get("u");
		if (proxyParam) return { "type": "proxy", "location": proxyParam };

		const redirParam = url.searchParams.get("r");
		if (redirParam) return { "type": "redirect", "location": redirParam };
	}

	return null;
}

function preprocessRequestHeaders(rheaders: Headers): Headers {
	const headers = new Headers(rheaders);

	headers.delete(FORWARD_HEADER_NAME);
	headers.delete("origin");
	headers.delete("host");

	return headers;
}

function postprocessResponseHeaders(rheaders: Headers, forwardUrl: string): Headers {
	const headers = new Headers(rheaders);

	headers.set(FORWARD_HEADER_NAME, forwardUrl);

	return headers;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 200,
				headers: corsHeadersFull,
			})
		}

		const dest = extractDestination(request);
		if (!dest) return pageNotFound(request);

		if (dest.type === "redirect") {
			return Response.redirect(dest.location, 307);
		}

		let response: Response;

		try {
			response = await fetch(dest.location, {
				body: request.body,
				method: request.method,
				headers: preprocessRequestHeaders(request.headers),
			})
		} catch (e) {
			response = new Response("soxy fetch error", { status: 502 });
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: {
				...postprocessResponseHeaders(response.headers, dest.location),
				...corsHeadersLite,
			}
		});
	},
} satisfies ExportedHandler<Env>;
