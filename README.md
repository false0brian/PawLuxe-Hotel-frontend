# PawLuxe Hotel Frontend

PawLuxe 보호자/스태프/관리자 콘솔 프론트엔드 (React + Vite).

## 화면 범위 (MVP)
- Owner Live: 펫 상태 조회, 스트림 토큰 발급
- Staff Board: 운영 액션(이동/기록/클립/사고) 중심 UI
- Admin Health: 카메라 헬스 모니터링
- Live Overlay: 카메라 영상 위 객체 bbox 실시간 오버레이

## 기술 스택
- React 18
- Vite
- Zustand

## 실행
```bash
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 4000
```

## 환경변수
```env
VITE_API_BASE=http://localhost:8001/api/v1
VITE_API_KEY=change-me
```

## Live Overlay 사용
1. 탭에서 `LiveOverlay` 선택
2. `camera_id`, `animal_id`(선택), `interval_ms` 입력
3. `Auto-fill stream URL` 또는 직접 `stream/playback URL` 입력
4. `Connect`를 누르면 WS(`ws/live-tracks`)와 함께 bbox 오버레이가 표시됩니다.

## 빌드
```bash
npm run build
npm run preview
```

## 백엔드 연동 엔드포인트
- `GET /pets/{pet_id}/status`
- `POST /auth/stream-token`
- `GET /admin/camera-health`
- `GET /live/cameras/{camera_id}/playback-url`
- `GET /live/tracks/latest`
- `WS /ws/live-tracks`

## 배포
- 정적 호스팅 권장 (CDN)
- API 서버는 별도 도메인으로 분리 권장

## 라이선스
Internal / Proprietary
