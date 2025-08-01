// request-context.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

// NestJS 의존성 주입 가능한 서비스 클래스
@Injectable()
export class RequestContextService {
  // 요청별 데이터 저장소로 사용할 AsyncLocalStorage(ALS) 인스턴스 생성
  private readonly als = new AsyncLocalStorage<Map<string, any>>();

  // 컨텍스트 실행 메서드
  // context: 요청별로 저장할 Map (ex. user, request 등)
  // callback: 해당 컨텍스트로 실행할 콜백 함수
  run(callback: () => void, context: Map<string, any>) {
    this.als.run(context, callback);
  }

  // 요청 컨텍스트에서 데이터 가져오기
  get<T = any>(key: string): T | undefined {
    const store = this.als.getStore();
    return store?.get(key);
  }

  // 요청 컨텍스트에 데이터 저장
  set(key: string, value: any) {
    const store = this.als.getStore();
    store?.set(key, value);
  }
}
