import 'reflect-metadata';

const HTTP_CODE_KEY = 'orbit:http-code';
const HEADER_KEY = 'orbit:headers';
const REDIRECT_KEY = 'orbit:redirect';
const RENDER_KEY = 'orbit:render';

export function HttpCode(statusCode: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(HTTP_CODE_KEY, statusCode, target, propertyKey);
    return descriptor;
  };
}

export function Header(name: string, value: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const existingHeaders: Record<string, string> = 
      Reflect.getMetadata(HEADER_KEY, target, propertyKey) || {};
    existingHeaders[name] = value;
    Reflect.defineMetadata(HEADER_KEY, existingHeaders, target, propertyKey);
    return descriptor;
  };
}

export function Redirect(url: string, statusCode: number = 302): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(REDIRECT_KEY, { url, statusCode }, target, propertyKey);
    return descriptor;
  };
}

export function Render(template: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(RENDER_KEY, template, target, propertyKey);
    return descriptor;
  };
}

export function getHttpCode(target: Object, propertyKey: string | symbol): number | undefined {
  return Reflect.getMetadata(HTTP_CODE_KEY, target, propertyKey);
}

export function getHeaders(target: Object, propertyKey: string | symbol): Record<string, string> {
  return Reflect.getMetadata(HEADER_KEY, target, propertyKey) || {};
}

export function getRedirect(target: Object, propertyKey: string | symbol): { url: string; statusCode: number } | undefined {
  return Reflect.getMetadata(REDIRECT_KEY, target, propertyKey);
}
