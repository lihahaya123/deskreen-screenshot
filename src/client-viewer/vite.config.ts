import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

interface PackageJson {
	version?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
	readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as PackageJson;

// load GA interceptor script from separate file
const gaInterceptorScript = readFileSync(
	join(__dirname, 'scripts', 'ga-interceptor.js'),
	'utf-8',
);

// plugin to replace html placeholders with env variables and inject GA interceptor
const replaceHtmlEnvPlugin = (): Plugin => {
	let gaTagId = '';
	let clientViewerVersion = packageJson.version || '';

	return {
		name: 'replace-html-env',
		configResolved(config) {
			gaTagId = config.env.VITE_CLIENT_VIEWER_GA_TAG || '';
			clientViewerVersion =
				config.env.VITE_CLIENT_VIEWER_VERSION || packageJson.version || '';
		},
		transformIndexHtml: {
			order: 'pre',
			handler(html) {
				let transformed = html
					.replace(/%VITE_CLIENT_VIEWER_GA_TAG%/g, gaTagId)
					.replace(/%VITE_CLIENT_VIEWER_VERSION%/g, clientViewerVersion);

				// inject GA interceptor script before GA script loads
				if (
					transformed.includes(
						'<script async src="https://www.googletagmanager.com/gtag/js',
					)
				) {
					transformed = transformed.replace(
						'<script async src="https://www.googletagmanager.com/gtag/js',
						`<script>${gaInterceptorScript}</script>\n    <script async src="https://www.googletagmanager.com/gtag/js`,
					);
				}

				return transformed;
			},
		},
	};
};

// https://vite.dev/config/
export default defineConfig({
	server: {
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:3131',
			},
			'/socket.io': {
				target: 'http://127.0.0.1:3131',
				ws: true,
			},
		},
	},
	plugins: [
		react(),
		legacy({
			targets: ['defaults', 'not IE 11'], // Or your specific browser targets
		}),
		nodePolyfills(),
		replaceHtmlEnvPlugin(),
	],
});
