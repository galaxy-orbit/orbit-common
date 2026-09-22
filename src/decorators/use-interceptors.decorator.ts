import 'reflect-metadata';
import type { Type } from '../interfaces/type.interface';
import type { ExecutionContext } from '../interfaces/execution-context.interface';

const INTERCEPTORS_KEY = 'orbit:interceptors';

export interface CallHandler<T = any> {
  handle(): Promise<T>;
}

export interface OrbitInterceptor<T = any, R = any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Promise<R>;
}

export function UseInterceptors(...interceptors: (Type<OrbitInterceptor> | OrbitInterceptor)[]): MethodDecorator & ClassDecorator {
  const decorator = (
    target: Object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor | void => {
    if (propertyKey && descriptor) {
      const existing = Reflect.getMetadata(INTERCEPTORS_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(INTERCEPTORS_KEY, [...interceptors, ...existing], target, propertyKey);
      return descriptor;
    }
    
    const existing = Reflect.getMetadata(INTERCEPTORS_KEY, target) || [];
    Reflect.defineMetadata(INTERCEPTORS_KEY, [...interceptors, ...existing], target);
  };
  return decorator as MethodDecorator & ClassDecorator;
}

export function getInterceptors(target: Object, propertyKey?: string | symbol): (Type<OrbitInterceptor> | OrbitInterceptor)[] {
  if (propertyKey) {
    const methodInterceptors = Reflect.getMetadata(INTERCEPTORS_KEY, target, propertyKey) || [];
    const classInterceptors = Reflect.getMetadata(INTERCEPTORS_KEY, target.constructor) || [];
    return [...classInterceptors, ...methodInterceptors];
  }
  return Reflect.getMetadata(INTERCEPTORS_KEY, target) || [];
}
