type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface Env {
	SITE_PASSWORD: string;
}

declare namespace App {
	interface Locals extends Runtime {}
}