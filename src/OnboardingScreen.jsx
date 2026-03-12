import { useState, useRef } from "react";
import { C } from "./constants.js";

const SLIDES = [
  {
    id:0,
    icon:"◈",
    accent:"linear-gradient(135deg,#1a293f,#0d1e30)",
    heading:"池本市へようこそ",
    sub:"Welcome to Ikemoto City",
    body:"池本市は、倉想空間と現実空間を「創造」で結ぶ実験都市です。市民として登録し、プロジェクトに参加・作品を制作・購入することで都市の成長に貢献できます。",
  },
  {
    id:1,
    icon:"⊞",
    accent:"linear-gradient(135deg,#1a3028,#0d1e18)",
    heading:"共創掲示板",
    sub:"Co-creation Board",
    body:"掲示板には市内のプロジェクトが掲載されています。必要なスキルを選び「参加申請」を行うことで参加できます。承認後はプロジェクトルームでメンバーとチャットできます。",
  },
  {
    id:2,
    icon:"◫",
    accent:"linear-gradient(135deg,#2a1a3a,#1a0d28)",
    heading:"商業区",
    sub:"Commercial District",
    body:"市内の店舗が登録した作品（製作物・製品・ライセンス）を閲覧・購入できます。作品には「CA指数」が設定されており、お気に入りの店舗をフォローすることもできます。",
  },
  {
    id:3,
    icon:"⊕",
    accent:"linear-gradient(135deg,#2a2510,#1a180a)",
    heading:"手続き",
    sub:"Administrative Procedures",
    body:"表現者認可申請・作品出力許可申請など、市民としての各種手続きができます。申請後は処理ログがリアルタイムで表示されます。",
  },
  {
    id:4,
    icon:"◉",
    accent:"linear-gradient(135deg,#1a2a3f,#0d1830)",
    heading:"マイページ",
    sub:"My Page",
    body:"市民証・EVI（存在価値係数）グラフ・参加中のプロジェクト・フォロー中の店舗・いいねした作品などを一覧で確認できます。設定・サポート・法的情報もここからアクセスできます。",
  },
];

export default function OnboardingScreen({ onDone }) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);

  const goNext = () => {
    if (idx < SLIDES.length - 1) setIdx(v => v+1);
    else onDone();
  };
  const goPrev = () => {
    if (idx > 0) setIdx(v => v-1);
  };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
    touchStartX.current = null;
  };

  const slide = SLIDES[idx];

  return (
    <div style={{
      position:"fixed",
      inset:0,
      zIndex:9000,
      display:"flex",
      flexDirection:"column",
      background:C.navy,
      overflow:"hidden",
    }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 背景グリッド */}
      <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none"}}/>

      {/* スライドエリア */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 28px 24px",textAlign:"center",position:"relative"}}>
        {/* アイコン */}
        <div style={{width:80,height:80,borderRadius:"50%",background:slide.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"rgba(255,255,255,0.7)",marginBottom:28,border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 4px 24px rgba(0,0,0,0.3)",transition:"all 0.35s ease"}}>
          {slide.icon}
        </div>

        {/* テキスト */}
        <div style={{color:"rgba(143,168,200,0.5)",fontSize:8,letterSpacing:"0.24em",marginBottom:8}}>{slide.sub}</div>
        <div style={{color:"#e4eaf4",fontSize:24,fontWeight:700,letterSpacing:"0.1em",marginBottom:18,lineHeight:1.3}}>{slide.heading}</div>
        <div style={{color:"rgba(200,218,238,0.7)",fontSize:12,lineHeight:1.9,letterSpacing:"0.04em",maxWidth:280}}>{slide.body}</div>
      </div>

      {/* ドットインジケーター */}
      <div style={{display:"flex",justifyContent:"center",gap:6,paddingBottom:16}}>
        {SLIDES.map((_,i) => (
          <div key={i} onClick={() => setIdx(i)}
            style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?C.green:"rgba(255,255,255,0.2)",transition:"all 0.25s ease",cursor:"pointer"}}/>
        ))}
      </div>

      {/* ボタン */}
      <div style={{padding:"0 28px 44px",display:"flex",gap:10}}>
        {idx > 0 && (
          <button onClick={goPrev}
            style={{flex:1,padding:"14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"rgba(200,218,238,0.7)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em"}}>
            {"← 戻る"}
          </button>
        )}
        <button onClick={goNext}
          style={{flex:2,padding:"14px",background:idx===SLIDES.length-1?C.green:"rgba(46,107,79,0.3)",border:"1px solid "+(idx===SLIDES.length-1?C.green:"rgba(46,107,79,0.4)"),borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",transition:"all 0.2s"}}>
          {idx === SLIDES.length-1 ? "市内にアクセスする" : "次へ →"}
        </button>
      </div>

      {/* スキップ */}
      {idx < SLIDES.length - 1 && (
        <button onClick={onDone}
          style={{position:"absolute",top:16,right:16,background:"transparent",border:"none",color:"rgba(143,168,200,0.35)",fontSize:10,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.12em",padding:"8px"}}>
          スキップ
        </button>
      )}
    </div>
  );
}
