/**
 * Secure response headers (helmet-style defaults) shared by the Orbit
 * framework. Zero-cost response headers applied by default:
 *  - REST: OrbitApplication (opt out via `security: false`)
 *  - GraphQL: GraphQLHandler (opt out via `secureHeaders: false`)
 */

export interface SecureHeaderOptions {
  /** Strict-Transport-Security. Default: max-age=15552000; includeSubDomains */
  hsts?: boolean | { maxAge?: number; includeSubDomains?: boolean; preload?: boolean };
  /** X-Frame-Options. Default: SAMEORIGIN. */
  frameguard?: 'DENY' | 'SAMEORIGIN' | false;
  /** X-Content-Type-Options: nosniff. Default: true */
  noSniff?: boolean;
  /** Referrer-Policy. Default: no-referrer */
  referrerPolicy?: string | false;
  /** Cross-Origin-Opener-Policy. Default: same-origin */
  crossOriginOpenerPolicy?: string | false;
  /** Cross-Origin-Resource-Policy. Default: same-origin */
  crossOriginResourcePolicy?: string | false;
  /** Remove X-Powered-By. Default: true */
  hidePoweredBy?: boolean;
  /** Origin-Agent-Cluster: ?1. Default: true */
  originAgentCluster?: boolean;
  /** X-Permitted-Cross-Domain-Policies. Default: none */
  permittedCrossDomainPolicies?: string | false;
  /** X-DNS-Prefetch-Control. Default: off */
  dnsPrefetchControl?: boolean;
}

const DEFAULTS: Required<SecureHeaderOptions> = {
  hsts: true,
  frameguard: 'SAMEORIGIN',
  noSniff: true,
  referrerPolicy: 'no-referrer',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-origin',
  hidePoweredBy: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: 'none',
  dnsPrefetchControl: false,
};

export function buildSecureHeaders(options: SecureHeaderOptions = {}): Record<string, string> {
  const opts = { ...DEFAULTS, ...options };
  const headers: Record<string, string> = {};

  if (opts.hidePoweredBy) {
    // Removing is handled by the caller; empty value marks removal intent.
    headers['X-Powered-By'] = '';
  }

  if (opts.noSniff) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  if (opts.frameguard) {
    headers['X-Frame-Options'] = opts.frameguard;
  }

  if (opts.hsts) {
    const hsts = typeof opts.hsts === 'object'
      ? opts.hsts
      : { maxAge: 15552000, includeSubDomains: true };
    let value = `max-age=${hsts.maxAge ?? 15552000}`;
    if (hsts.includeSubDomains !== false) value += '; includeSubDomains';
    if ('preload' in hsts && hsts.preload) value += '; preload';
    headers['Strict-Transport-Security'] = value;
  }

  if (opts.referrerPolicy) {
    headers['Referrer-Policy'] = opts.referrerPolicy;
  }

  if (opts.crossOriginOpenerPolicy) {
    headers['Cross-Origin-Opener-Policy'] = opts.crossOriginOpenerPolicy;
  }

  if (opts.crossOriginResourcePolicy) {
    headers['Cross-Origin-Resource-Policy'] = opts.crossOriginResourcePolicy;
  }

  if (opts.originAgentCluster) {
    headers['Origin-Agent-Cluster'] = '?1';
  }

  if (opts.permittedCrossDomainPolicies) {
    headers['X-Permitted-Cross-Domain-Policies'] = opts.permittedCrossDomainPolicies;
  }

  if (opts.dnsPrefetchControl) {
    headers['X-DNS-Prefetch-Control'] = 'on';
  } else {
    headers['X-DNS-Prefetch-Control'] = 'off';
  }

  return headers;
}

/**
 * Apply a precomputed secure-header record onto a Response.
 *
 * Fast path: responses created by the Orbit pipeline have mutable headers,
 * so they are updated in place — no Headers clone, no Response rebuild.
 * Fallback: responses with immutable headers (e.g. forwarded from fetch())
 * are cloned into a new Response, preserving the previous behavior.
 */
export function applySecureHeaderRecord(
  response: Response,
  secure: Record<string, string>
): Response {
  try {
    for (const [key, value] of Object.entries(secure)) {
      if (value === '') {
        response.headers.delete(key);
      } else {
        response.headers.set(key, value);
      }
    }
    return response;
  } catch {
    // immutable headers — fall back to clone-and-rebuild
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(secure)) {
      if (value === '') {
        headers.delete(key);
      } else {
        headers.set(key, value);
      }
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

/** Merge secure headers into an existing Response (creating a new one). */
export function withSecureHeaders(
  response: Response,
  options: SecureHeaderOptions = {}
): Response {
  return applySecureHeaderRecord(response, buildSecureHeaders(options));
}
