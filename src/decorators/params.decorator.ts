import 'reflect-metadata';

const ROUTE_PARAMS_KEY = 'orbit:route:params';

export enum ParamType {
  BODY = 'body',
  QUERY = 'query',
  PARAM = 'param',
  HEADERS = 'headers',
  REQUEST = 'request',
  RESPONSE = 'response',
  IP = 'ip',
  SESSION = 'session',
  FILE = 'file',
  FILES = 'files',
}

export interface ParamMetadata {
  type: ParamType;
  data?: string;
  index: number;
}

function createParamDecorator(type: ParamType) {
  return (data?: string): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
      if (!propertyKey) return;
      
      const existingParams: ParamMetadata[] = 
        Reflect.getMetadata(ROUTE_PARAMS_KEY, target, propertyKey) || [];
      
      existingParams.push({
        type,
        data,
        index: parameterIndex,
      });
      
      Reflect.defineMetadata(ROUTE_PARAMS_KEY, existingParams, target, propertyKey);
    };
  };
}

export const Body = createParamDecorator(ParamType.BODY);
export const Query = createParamDecorator(ParamType.QUERY);
export const Param = createParamDecorator(ParamType.PARAM);
export const Headers = createParamDecorator(ParamType.HEADERS);
export const Req = createParamDecorator(ParamType.REQUEST);
export const Request = Req;
export const Res = createParamDecorator(ParamType.RESPONSE);
export const Response = Res;
export const Ip = createParamDecorator(ParamType.IP);
export const Session = createParamDecorator(ParamType.SESSION);
export const UploadedFile = createParamDecorator(ParamType.FILE);
export const UploadedFiles = createParamDecorator(ParamType.FILES);

export function getParamMetadata(target: Object, propertyKey: string | symbol): ParamMetadata[] {
  return Reflect.getMetadata(ROUTE_PARAMS_KEY, target, propertyKey) || [];
}
