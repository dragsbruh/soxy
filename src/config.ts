export const corsHeadersFull = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
	'access-control-allow-headers': '*',
	'access-control-max-age': '86400',
};

export const corsHeadersLite = {
	'access-control-allow-origin': '*',
}

const redirects: Record<string, string> = {
	"/docs": "https://codeberg.org/dragsbruh/soxy",
};

export const pageNotFound = (request: Request): Response => {
	const path = new URL(request.url).pathname;

	if (redirects[path]) {
		return Response.redirect(redirects[path], 307);
	}

	return new Response("thats not right, see /docs");
}
