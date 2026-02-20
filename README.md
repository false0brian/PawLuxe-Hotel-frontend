# PawLuxe Hotel Frontend

PawLuxe 보호자/스태프/관리자 콘솔 프론트엔드 (React + Vite).

## 화면 범위 (MVP)
- Owner Live: 펫 상태 조회, 스트림 토큰 발급
- Staff Board: 운영 액션(이동/기록/클립/사고) 중심 UI
- Admin Health: 카메라 헬스 모니터링

## 기술 스택
- React 18
- Vite
- Zustand

## 실행
```bash
npm install
cp .env.example .env
npm run dev
```

## 환경변수
```env
VITE_API_BASE=http://localhost:8000/api/v1
VITE_API_KEY=change-me
```

## 빌드
```bash
npm run build
npm run preview
```

## 백엔드 연동 엔드포인트
- `GET /pets/{pet_id}/status`
- `POST /auth/stream-token`
- `GET /admin/camera-health`

## 배포
- 정적 호스팅 권장 (CDN)
- API 서버는 별도 도메인으로 분리 권장

## 라이선스
Internal / Proprietary
