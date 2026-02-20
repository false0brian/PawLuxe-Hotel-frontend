# PawLuxe Hotel Frontend

PawLuxe 보호자/스태프/관리자 콘솔 프론트엔드 (React + Vite).

## 화면 범위 (MVP)
- Owner Live: 펫 상태 조회, 스트림 토큰 발급
- Owner Stream Session: verify/close로 동시 세션 제한 동작 점검
- Owner Report Clips: booking 리포트에서 오늘 클립(자동/수동) 확인
- Staff Board: 운영 액션(이동/기록/클립/사고) 중심 UI
- Staff Alerts: 규칙 기반 알림 조회/ack/resolved
- Admin Health: 카메라 헬스 모니터링
- Zone Live: 존 단위 실시간 관측/트랙/카메라 헬스 집계
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

## Zone Live 사용
1. 탭에서 `ZoneLive` 선택
2. `window_seconds`, `refresh_ms` 설정
3. 필요 시 `camera_id`, `animal_id`로 필터
4. 존 카드에서 `관측/트랙/동물 수`와 카메라 상태를 실시간 확인
5. 아래 `Zone Heatmap`에서 시간 버킷별 존 트래픽 추이를 확인

## Staff Alerts 사용
1. `Staff` 탭에서 `알림 평가 실행` 클릭
2. `알림 조회`로 open 알림 리스트 확인
3. 알림 WS 연결 상태(`Alerts WS connected`) 확인
4. 각 카드에서 `ack` 또는 `resolve` 처리
5. `자동 클립 생성`으로 최근 트랙 기반 하이라이트를 즉시 생성

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
- `GET /live/zones/summary`
- `GET /live/zones/heatmap`
- `WS /ws/live-tracks`
- `WS /ws/staff-alerts`
- `POST /auth/stream-verify`
- `POST /auth/stream-session/close`
- `GET /staff/alerts`
- `POST /staff/alerts/{alert_id}/ack`
- `POST /system/alerts/evaluate`
- `POST /system/live-tracks/ingest`
- `POST /system/clips/auto-generate`

## 배포
- 정적 호스팅 권장 (CDN)
- API 서버는 별도 도메인으로 분리 권장

## 라이선스
Internal / Proprietary
