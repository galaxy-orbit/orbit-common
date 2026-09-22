import { describe, test, expect } from 'bun:test';
import 'reflect-metadata';
import { Body, Param, Query, Headers, Req, Res, Ip, getParamMetadata } from './params.decorator';
import { UseGuards, getGuards } from './use-guards.decorator';
import { UseInterceptors, getInterceptors } from './use-interceptors.decorator';
import { UsePipes, getPipes } from './use-pipes.decorator';
import { Catch, UseFilters, getFilters, getCatchExceptions } from './catch.decorator';
import { HttpCode, Header, Redirect, getHttpCode, getHeaders, getRedirect } from './http-code.decorator';
import { Transform, ToInt, ToBoolean, Trim, applyTransforms } from './transform.decorator';

describe('param decorators', () => {
  test('Body/Param/Query write metadata readable by core pipeline', () => {
    class T {
      handler(
        @Body() body: any,
        @Param('id') id: string,
        @Query('q') q: string,
        @Headers('x-token') token: string,
        @Req() req: any,
        @Res() res: any,
        @Ip() ip: string,
      ) {}
    }

    const params = getParamMetadata(T.prototype, 'handler');
    expect(params).toHaveLength(7);
    // parameter decorators are applied in reverse order — sort by index
    const byIndex = [...params].sort((a, b) => a.index - b.index);
    expect(byIndex[0]).toMatchObject({ type: 'body', index: 0 });
    expect(byIndex[1]).toMatchObject({ type: 'param', data: 'id', index: 1 });
    expect(byIndex[2]).toMatchObject({ type: 'query', data: 'q', index: 2 });
    expect(byIndex[3]).toMatchObject({ type: 'headers', data: 'x-token', index: 3 });
    expect(byIndex[4]).toMatchObject({ type: 'request', index: 4 });
    expect(byIndex[5]).toMatchObject({ type: 'response', index: 5 });
    expect(byIndex[6]).toMatchObject({ type: 'ip', index: 6 });
  });
});

describe('class/method decorators', () => {
  class GuardA { canActivate() { return true; } }
  class GuardB { canActivate() { return true; } }
  class InterceptorA { intercept(ctx: any, next: any) { return next.handle(); } }
  class PipeA { transform(v: any) { return v; } }
  class FilterA { catch(e: any) { return e; } }

  it('UseGuards stores guards at class and method level', () => {
    @UseGuards(GuardA)
    class C {
      @UseGuards(GuardB)
      method() {}
      plain() {}
    }
    expect((getGuards(C) as any[]).map(g => g?.name)).toContain('GuardA');
    // class-level guards run before method-level ones
    expect((getGuards(C.prototype, 'method') as any[]).map(g => g?.name)).toEqual(['GuardA', 'GuardB']);
    expect((getGuards(C.prototype, 'plain') as any[]).map(g => g?.name)).toEqual(['GuardA']);
  });

  it('UseInterceptors stores interceptors', () => {
    @UseInterceptors(InterceptorA)
    class C { method() {} }
    expect(getInterceptors(C)).toHaveLength(1);
    expect(getInterceptors(C.prototype, 'method')).toHaveLength(1);
  });

  it('UsePipes stores pipes', () => {
    class C {
      @UsePipes(PipeA)
      method() {}
    }
    expect(getPipes(C.prototype, 'method')).toHaveLength(1);
  });

  it('UseFilters stores filters', () => {
    @UseFilters(FilterA)
    class C { method() {} }
    expect(getFilters(C)).toHaveLength(1);
    expect(getFilters(C.prototype, 'method')).toHaveLength(1);
  });

  it('Catch records exception types', () => {
    class MyError extends Error {}
    @Catch(MyError)
    class F { catch() {} }
    expect(getCatchExceptions(F)).toEqual([MyError]);
  });
});

describe('http metadata decorators', () => {
  class C {
    @HttpCode(201)
    @Header('X-Trace', 'abc')
    create() {}
    @Redirect('/next', 301)
    go() {}
    normal() {}
  }

  it('HttpCode stores status code', () => {
    expect(getHttpCode(C.prototype, 'create')).toBe(201);
    expect(getHttpCode(C.prototype, 'normal')).toBeUndefined();
  });

  it('Header stores custom headers', () => {
    expect(getHeaders(C.prototype, 'create')).toEqual({ 'X-Trace': 'abc' });
  });

  it('Redirect stores url and status', () => {
    expect(getRedirect(C.prototype, 'go')).toEqual({ url: '/next', statusCode: 301 });
  });
});

describe('transform decorators', () => {
  class User {
    @ToInt() age: any = '42';
    @Transform((v: any) => (v === 'true')) active: any = 'true';
    @Trim() name: any = '  orbit  ';
    @Transform((v: any) => v?.toUpperCase?.()) email: any = 'a@b.c';
  }

  it('applyTransforms mutates instance values', () => {
    const u = new User();
    applyTransforms(u);
    expect(u.age).toBe(42);
    expect(u.active).toBe(true);
    expect(u.name).toBe('orbit');
    expect((u as any).email).toBe('A@B.C');
  });

  it('ToBoolean handles common string cases', () => {
    class B { @ToBoolean() v: any = 'yes'; @ToBoolean() w: any = '0'; }
    const b = new B();
    applyTransforms(b);
    expect(b.v).toBe(true);
    expect((b as any).w).toBe(false);
  });

  it('Trim only affects strings', () => {
    class T { @Trim() v: any = 123; }
    const t = new T();
    applyTransforms(t);
    expect(t.v).toBe(123);
  });
});

// tiny local `it` alias to keep describe blocks terse
function it(name: string, fn: () => void) { test(name, fn); }
