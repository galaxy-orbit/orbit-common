import 'reflect-metadata';
import type { CanActivate, GuardClass } from '../interfaces/guard.interface';

export const GUARDS_METADATA = 'orbit:guards';

export function UseGuards(...guards: (GuardClass | CanActivate)[]): MethodDecorator & ClassDecorator {
  const decorator = (
    target: Object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor | void => {
    if (propertyKey && descriptor) {
      const existingGuards = Reflect.getMetadata(GUARDS_METADATA, target, propertyKey) || [];
      Reflect.defineMetadata(GUARDS_METADATA, [...guards, ...existingGuards], target, propertyKey);
      return descriptor;
    }
    
    const existingGuards = Reflect.getMetadata(GUARDS_METADATA, target) || [];
    Reflect.defineMetadata(GUARDS_METADATA, [...guards, ...existingGuards], target);
  };
  return decorator as MethodDecorator & ClassDecorator;
}

export function getGuards(target: Object, propertyKey?: string | symbol): (GuardClass | CanActivate)[] {
  if (propertyKey) {
    const methodGuards = Reflect.getMetadata(GUARDS_METADATA, target, propertyKey) || [];
    const classGuards = Reflect.getMetadata(GUARDS_METADATA, target.constructor) || [];
    return [...classGuards, ...methodGuards];
  }
  return Reflect.getMetadata(GUARDS_METADATA, target) || [];
}
