import 'reflect-metadata';
import type { Type } from '../interfaces/type.interface';

const PIPES_KEY = 'orbit:pipes';

export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type;
  data?: string;
}

export interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata: ArgumentMetadata): R | Promise<R>;
}

export function UsePipes(...pipes: (Type<PipeTransform> | PipeTransform)[]): MethodDecorator & ClassDecorator {
  const decorator = (
    target: Object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor | void => {
    if (propertyKey && descriptor) {
      const existingPipes = Reflect.getMetadata(PIPES_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(PIPES_KEY, [...pipes, ...existingPipes], target, propertyKey);
      return descriptor;
    }
    
    const existingPipes = Reflect.getMetadata(PIPES_KEY, target) || [];
    Reflect.defineMetadata(PIPES_KEY, [...pipes, ...existingPipes], target);
  };
  return decorator as MethodDecorator & ClassDecorator;
}

export function getPipes(target: Object, propertyKey?: string | symbol): (Type<PipeTransform> | PipeTransform)[] {
  if (propertyKey) {
    const methodPipes = Reflect.getMetadata(PIPES_KEY, target, propertyKey) || [];
    const classPipes = Reflect.getMetadata(PIPES_KEY, target.constructor) || [];
    return [...classPipes, ...methodPipes];
  }
  return Reflect.getMetadata(PIPES_KEY, target) || [];
}
