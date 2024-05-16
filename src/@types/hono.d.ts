import 'hono';

declare module 'hono' {
	interface ContextVariableMap extends Record<string, any> {
		ratelimit: Ratelimit;
	}
}
