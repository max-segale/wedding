type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface Env {
	SITE_PASSWORD: string;
	RESEND_API_KEY: string;
}

declare namespace App {
	interface Locals extends Runtime {}
}
