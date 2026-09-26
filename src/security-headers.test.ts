import { describe, test, expect } from 'bun:test';
import { buildSecureHeaders, withSecureHeaders } from './security-headers';

describe('buildSecureHeaders', () => {
  test('returns helmet-style defaults', () => {
    const h = buildSecureHeaders();
    expect(h['X-Content-Type-Options']).toBe('nosniff');
    expect(h['X-Frame-Options']).toBe('SAMEORIGIN');
    expect(h['Strict-Transport-Security']).toContain('max-age=15552000');
    expect(h['Strict-Transport-Security']).toContain('includeSubDomains');
    expect(h['Referrer-Policy']).toBe('no-referrer');
    expect(h['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(h['Cross-Origin-Resource-Policy']).toBe('same-origin');
    expect(h['Origin-Agent-Cluster']).toBe('?1');
    expect(h['X-Permitted-Cross-Domain-Policies']).toBe('none');
    expect(h['X-DNS-Prefetch-Control']).toBe('off');
    expect(h['X-Powered-By']).toBe('');
  });

  test('customizes hsts', () => {
    const h = buildSecureHeaders({
      hsts: { maxAge: 60, includeSubDomains: false, preload: true },
    });
    expect(h['Strict-Transport-Security']).toBe('max-age=60; preload');
  });

  test('respects opt-outs', () => {
    const h = buildSecureHeaders({
      frameguard: false,
      referrerPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      hidePoweredBy: false,
    });
    expect(h['X-Frame-Options']).toBeUndefined();
    expect(h['Referrer-Policy']).toBeUndefined();
    expect(h['Cross-Origin-Opener-Policy']).toBeUndefined();
    expect(h['Cross-Origin-Resource-Policy']).toBeUndefined();
    expect(h['X-Powered-By']).toBeUndefined();
  });

  test('frameguard accepts DENY', () => {
    const h = buildSecureHeaders({ frameguard: 'DENY' });
    expect(h['X-Frame-Options']).toBe('DENY');
  });

  test('dnsPrefetchControl: true turns it on', () => {
    const h = buildSecureHeaders({ dnsPrefetchControl: true });
    expect(h['X-DNS-Prefetch-Control']).toBe('on');
  });
});

describe('withSecureHeaders', () => {
  test('merges headers into response preserving body/status', async () => {
    const original = new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
    const merged = withSecureHeaders(original);
    expect(merged.status).toBe(201);
    expect(merged.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(merged.headers.get('Content-Type')).toBe('application/json');
    const body = await merged.json();
    expect(body.ok).toBe(true);
  });

  test('removes X-Powered-By when present', () => {
    const original = new Response('{}', {
      headers: { 'X-Powered-By': 'Express' },
    });
    const merged = withSecureHeaders(original);
    expect(merged.headers.get('X-Powered-By')).toBeNull();
  });
});
