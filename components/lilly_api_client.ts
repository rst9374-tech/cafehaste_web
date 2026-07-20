// cafehaste-web/components/lilly_api_client.ts

// 릴리가 켜져있는 매장 PC 로컬 포트 8080
const LILLY_LOCAL_API_BASE = 'http://localhost:8080';

// 릴리 일렉트론의 보안 게이트(checkVerifiedToken)를 통과하기 위한 진짜 비밀키 (가맹점 번호가 곧 API Key가 됩니다!)
const LILLY_API_KEY = (import.meta.env && import.meta.env.VITE_LILLY_API_KEY) || '';

export const lillyApiClient = {
  /**
   * 1. 로컬 API 서버 생사 확인 (v2/ping)
   */
  checkConnection: async (): Promise<{ success: boolean; message: string; result?: string }> => {
    try {
      const response = await fetch(`${LILLY_LOCAL_API_BASE}/v2/ping`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${LILLY_API_KEY}` // ◀ 보안 인증 헤더 주입
        }
      });
      if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);
      return await response.json();
    } catch (error: any) {
      throw new Error('매장 PC의 Lilly 프로그램이 꺼져있거나 8080 포트가 닫혀 있습니다.');
    }
  },

  /**
   * 2. 컵 디스펜서 강제 배출 명령 (실전 운영 원칙에 따라 무조건 원격 디스코드 중계 API 호출)
   */
  dispenseCup: async (type: 'HOT' | 'ICED', storeCode: string): Promise<{ success: boolean; message: string; result?: any }> => {
    try {
      if (!storeCode) {
        throw new Error('매장 코드가 누락되었습니다.');
      }
      const response = await fetch('/api/remote/dispense-cup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ type, storeCode })
      });
      if (!response.ok) {
        throw new Error(`원격 서버 응답 실패 (HTTP: ${response.status})`);
      }
      return await response.json();
    } catch (remoteErr: any) {
      throw new Error(`원격 컵 배출 신호 전송 실패 (${remoteErr.message})`);
    }
  },

  /**
   * 4. 물(정수/온수) 원격 강제 배출 명령 (원격 디스코드 중계 API 호출)
   */
  dispenseWater: async (type: '정수' | '온수', storeCode: string): Promise<{ success: boolean; message: string; result?: any }> => {
    try {
      if (!storeCode) {
        throw new Error('매장 코드가 누락되었습니다.');
      }
      const response = await fetch('/api/remote/dispense-water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ type, storeCode })
      });
      if (!response.ok) {
        throw new Error(`원격 서버 응답 실패 (HTTP: ${response.status})`);
      }
      return await response.json();
    } catch (remoteErr: any) {
      throw new Error(`원격 물 추출 신호 전송 실패 (${remoteErr.message})`);
    }
  },

  /**
   * 5. 시럽 원격 강제 배출 명령 (원격 디스코드 중계 API 호출)
   */
  dispenseSyrup: async (syrupName: string, amount: number, storeCode: string): Promise<{ success: boolean; message: string; result?: any }> => {
    try {
      if (!storeCode) {
        throw new Error('매장 코드가 누락되었습니다.');
      }
      const response = await fetch('/api/remote/dispense-syrup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ syrupName, amount, storeCode })
      });
      if (!response.ok) {
        throw new Error(`원격 서버 응답 실패 (HTTP: ${response.status})`);
      }
      return await response.json();
    } catch (remoteErr: any) {
      throw new Error(`원격 시럽 추출 신호 전송 실패 (${remoteErr.message})`);
    }
  },


  /**
   * 3. 레시피 원격 동기화 명령 (백엔드 우회 릴레이)
   */
  syncRecipe: async (recipeData: any, storeCode: string): Promise<{ success: boolean; message: string; result?: any }> => {
    try {
      if (!storeCode) {
        throw new Error('매장 코드가 누락되었습니다.');
      }
      const response = await fetch('/api/remote/recipe/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ recipeData, storeCode })
      });
      if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);
      return await response.json();
    } catch (error: any) {
      throw new Error(`원격 레시피 동기화 신호 전송 실패 (${error.message})`);
    }
  },

  /**
   * 6. 판매 영업 상태 원격 토글 제어 (v3)
   */
  toggleSales: async (isSelling: boolean, storeCode: string): Promise<{ success: boolean; message: string; result?: any }> => {
    try {
      if (!storeCode) {
        throw new Error('매장 코드가 누락되었습니다.');
      }
      const response = await fetch('/api/remote/v3/sales/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ isSelling, storeCode })
      });
      if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);
      return await response.json();
    } catch (error: any) {
      throw new Error(`원격 영업 토글 신호 전송 실패 (${error.message})`);
    }
  },

  /**
   * 7. 로컬 DID 원격 기동 (v3)
   */
  openLocalDID: async (storeCode: string): Promise<{ success: boolean; message: string; result?: any }> => {
    try {
      if (!storeCode) {
        throw new Error('매장 코드가 누락되었습니다.');
      }
      const response = await fetch('/api/remote/v3/did/open/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ storeCode })
      });
      if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);
      return await response.json();
    } catch (error: any) {
      throw new Error(`원격 로컬 DID 기동 신호 전송 실패 (${error.message})`);
    }
  },

  /**
   * 8. 원격 DID 원격 기동 (v3)
   */
  openRemoteDID: async (storeCode: string): Promise<{ success: boolean; message: string; result?: any }> => {
    try {
      if (!storeCode) {
        throw new Error('매장 코드가 누락되었습니다.');
      }
      const response = await fetch('/api/remote/v3/did/open/remote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ storeCode })
      });
      if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);
      return await response.json();
    } catch (error: any) {
      throw new Error(`원격 원격 DID 기동 신호 전송 실패 (${error.message})`);
    }
  }
};
