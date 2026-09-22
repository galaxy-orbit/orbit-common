import 'reflect-metadata';
import type { Type } from '../interfaces/type.interface';

const EXCEPTION_FILTERS_KEY = 'orbit:exception-filters';
const CATCH_KEY = 'orbit:catch';

export interface ArgumentsHost {
  getArgs<T extends any[] = any[]>(): T;
  getArgByIndex<T = any>(index: number): T;
  getType<T extends string = string>(): T;
}

export interface HttpArgumentsHost {
  getRequest<T = any>(): T;
  getResponse<T = any>(): T;
  getNext<T = any>(): T;
}

export interface ExceptionFilter<T = any> {
  catch(exception: T, host: ArgumentsHost): any;
}

export function Catch(...exceptions: Type<any>[]): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(CATCH_KEY, exceptions, target);
  };
}

export function UseFilters(...filters: (Type<ExceptionFilter> | ExceptionFilter)[]): MethodDecorator & ClassDecorator {
  const decorator = (
    target: Object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor | void => {
    if (propertyKey && descriptor) {
      const existing = Reflect.getMetadata(EXCEPTION_FILTERS_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(EXCEPTION_FILTERS_KEY, [...filters, ...existing], target, propertyKey);
      return descriptor;
    }
    
    const existing = Reflect.getMetadata(EXCEPTION_FILTERS_KEY, target) || [];
    Reflect.defineMetadata(EXCEPTION_FILTERS_KEY, [...filters, ...existing], target);
  };
  return decorator as MethodDecorator & ClassDecorator;
}

export function getCatchExceptions(target: Type): Type<any>[] {
  return Reflect.getMetadata(CATCH_KEY, target) || [];
}

export function getFilters(target: Object, propertyKey?: string | symbol): (Type<ExceptionFilter> | ExceptionFilter)[] {
  if (propertyKey) {
    const methodFilters = Reflect.getMetadata(EXCEPTION_FILTERS_KEY, target, propertyKey) || [];
    const classFilters = Reflect.getMetadata(EXCEPTION_FILTERS_KEY, target.constructor) || [];
    return [...classFilters, ...methodFilters];
  }
  return Reflect.getMetadata(EXCEPTION_FILTERS_KEY, target) || [];
}
