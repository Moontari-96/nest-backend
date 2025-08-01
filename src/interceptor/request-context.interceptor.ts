// request-context.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestContextService } from './request-context.service';

// NestJS 인터셉터 클래스 선언 (DI 가능)
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  // RequestContextService를 주입받아 ALS 기능 사용
  constructor(private readonly contextService: RequestContextService) {}

  // 인터셉터 핵심 메서드: 모든 요청 처리 전에 실행됨
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // NestJS의 추상화된 context에서 HTTP request 객체 추출
    const request = context.switchToHttp().getRequest();

    // 요청마다 사용할 컨텍스트(Map 형태)를 생성
    const contextMap = new Map<string, any>();

    // 필요한 데이터들을 컨텍스트에 저장 (예: request 객체, user 정보 등)
    contextMap.set('request', request);
    contextMap.set('user', request.user); // 필요 시 유저 정보 등 추가

    // 비동기 컨텍스트를 ALS로 실행
    return new Observable((observer) => {
      // run 안에서 실행되는 모든 코드/서비스는 contextMap을 공유함
      this.contextService.run(() => {
        // 실제 요청 처리 체인 실행 (다음 핸들러로 전달)
        next.handle().subscribe({
          next: (value) => observer.next(value), // 응답 처리
          error: (err) => observer.error(err), // 에러 처리
          complete: () => observer.complete(), // 완료 처리
        });
      }, contextMap); // ALS에 요청별 contextMap 바인딩
    });
  }
}
