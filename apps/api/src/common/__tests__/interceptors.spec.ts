import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseTransformInterceptor } from '../interceptors/response-transform.interceptor';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();
  });

  it('should wrap response in success envelope', (done) => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = { handle: () => of({ id: 1, name: 'test' }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'test' });
      expect(result.timestamp).toBeDefined();
      done();
    });
  });

  it('should wrap array responses', (done) => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = { handle: () => of([1, 2, 3]) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
      done();
    });
  });

  it('should wrap null responses', (done) => {
    const context = {} as ExecutionContext;
    const handler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      done();
    });
  });
});
