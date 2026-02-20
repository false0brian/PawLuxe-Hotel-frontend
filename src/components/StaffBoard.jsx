import { useState } from "react";

export default function StaffBoard() {
  const [items] = useState([
    { pet: "Milo", zone: "ROOM-031", risk: "분리불안", next: "산책 14:30" },
    { pet: "Nabi", zone: "PLAY-A", risk: "투약 필요", next: "투약 15:00" },
    { pet: "Coco", zone: "ISOLATION-2", risk: "회복 관찰", next: "식이 기록 15:10" },
  ]);

  return (
    <section className="panel">
      <h2>Staff Today Board</h2>
      <p className="muted">기록 5초 컷을 목표로 한 운영 중심 화면입니다.</p>
      <div className="cards">
        {items.map((it) => (
          <article className="card" key={it.pet}>
            <strong>{it.pet}</strong>
            <span>현재 존: {it.zone}</span>
            <span>위험 배지: {it.risk}</span>
            <span>다음 액션: {it.next}</span>
            <div className="row">
              <button>이동</button>
              <button>기록</button>
              <button>클립</button>
              <button>사고</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
