import { useRef, useEffect, useState } from "react";
import { C } from "./constants.js";

// ─────────────────────────────────────────────
// CYBER TICKER
// ─────────────────────────────────────────────
export function Ticker({ text }) {
  return (
    <div style={{
      background:"linear-gradient(90deg,#0a1a0e,#0d2016,#0a1a0e)",
      borderTop:"1px solid rgba(46,107,79,0.5)",
      borderBottom:"1px solid rgba(46,107,79,0.5)",
      padding:"5px 0",
      overflow:"hidden",
      position:"relative",
    }}>
      {/* スキャングロー */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent 0%,rgba(46,160,79,0.06) 50%,transparent 100%)",animation:"scanGlow 3s ease-in-out infinite",pointerEvents:"none"}}/>
      <span style={{
        animation:"ticker 48s linear infinite",
        display:"inline-block",
        fontFamily:"'SF Mono','Fira Mono','Courier New',monospace",
        fontSize:8.5,
        letterSpacing:"0.18em",
        color:"rgba(100,220,140,0.85)",
        textShadow:"0 0 6px rgba(46,160,79,0.55)",
        whiteSpace:"nowrap",
      }}>
        {"　"}{text}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// APPROVED STAMP
// ─────────────────────────────────────────────
export function Stamp() {
  return (
    <div style={{position:"absolute",bottom:7,right:9,border:"1px solid rgba(46,107,79,0.18)",borderRadius:2,padding:"1px 4px",transform:"rotate(-7deg)",pointerEvents:"none"}}>
      <span style={{fontSize:6.5,fontWeight:700,letterSpacing:"0.18em",color:"rgba(46,107,79,0.22)"}}>APPROVED</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// WATERMARK (rotated citizen ID)
// ─────────────────────────────────────────────
export function Watermark({ id }) {
  return (
    <div style={{position:"fixed",bottom:78,right:0,zIndex:40,transform:"rotate(-90deg)",transformOrigin:"right center",pointerEvents:"none",userSelect:"none"}}>
      <span style={{fontSize:8,color:"rgba(26,37,64,0.09)",letterSpacing:"0.2em",fontWeight:700,whiteSpace:"nowrap"}}>{id||"IK-2026-████"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// RR COUNTER
// ─────────────────────────────────────────────
export function RR({ value }) {
  return (
    <div style={{position:"fixed",bottom:78,left:11,zIndex:40,pointerEvents:"none"}}>
      <div style={{fontSize:7,color:"rgba(26,37,64,0.2)",letterSpacing:"0.14em",marginBottom:1}}>RR</div>
      <div style={{fontSize:10,color:"rgba(26,37,64,0.16)",fontWeight:700,letterSpacing:"0.1em",fontVariantNumeric:"tabular-nums"}}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
export function SectionHead({ accent, label, sub }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:11}}>
      <div style={{width:2.5,height:13,background:accent||C.navy,borderRadius:2,flexShrink:0,boxShadow:"0 0 5px "+(accent||C.navy)+"55"}}/>
      <span style={{fontSize:10,color:C.txM,letterSpacing:"0.18em",fontWeight:600}}>{label}</span>
      {sub&&<span style={{fontSize:8.5,color:C.txL,letterSpacing:"0.08em"}}>{sub}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// LOG TERMINAL
// ─────────────────────────────────────────────
export function LogTerminal({ logs, running, dark=true }) {
  const ref = useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.scrollTop=ref.current.scrollHeight; },[logs]);

  const isSuccess = (s) =>
    s.includes("サポート") || s.includes("完了") || s.includes("承認") ||
    s.includes("記録されました") || s.includes("受理されました") ||
    s.includes("終了しました") || s.includes("公開されました");

  const getColor = (s) => dark
    ? (isSuccess(s) ? "#4caf7d" : "#4a7060")
    : (isSuccess(s) ? C.green   : C.txM);

  const getPrefix = (s) => isSuccess(s) ? "" : "> ";

  return (
    <div ref={ref} style={{background:dark?"#07101a":"#f0f4f8",border:"1px solid "+(dark?"rgba(46,107,79,0.35)":C.border),borderRadius:6,padding:"11px 13px",marginBottom:16,height:148,overflowY:"auto",scrollbarWidth:"none",fontFamily:"'SF Mono','Fira Mono',monospace",fontSize:9.5,lineHeight:1.9,letterSpacing:"0.03em",boxShadow:dark?"inset 0 0 20px rgba(0,0,0,0.3)":"none"}}>
      {logs
        .filter((l) => l != null && String(l).trim() !== "")
        .map((log, i) => {
          const s = String(log);
          return (
            <div key={i} style={{color:getColor(s)}}>
              {getPrefix(s)}{s}
            </div>
          );
        })}
      {running && <span style={{animation:"cursorBlink 0.7s infinite",color:dark?"#4caf7d":C.green}}>▋</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// BUTTON — with cyber glow on press
// ─────────────────────────────────────────────
export function Btn({ label, onClick, variant="primary", small=false, disabled=false }) {
  const [pressed, setPressed] = useState(false);
  const bg  = variant==="primary"?C.green : variant==="navy"?C.navy : variant==="danger"?C.red : "transparent";
  const col = variant==="ghost" ? C.txM : "#fff";
  const bdr = variant==="ghost" ? "1px solid "+C.border : "none";
  const glowColor = variant==="primary"?"rgba(46,160,79,0.55)" : variant==="navy"?"rgba(26,50,120,0.55)" : "transparent";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        padding:small?"6px 14px":"11px 0",
        width:small?"auto":"100%",
        background:disabled?"rgba(46,107,79,0.2)":bg,
        border:bdr,
        borderRadius:6,
        color:disabled?"rgba(255,255,255,0.35)":col,
        fontSize:small?9:10,
        fontWeight:600,
        letterSpacing:"0.12em",
        cursor:disabled?"default":"pointer",
        fontFamily:"inherit",
        transition:"all 0.15s",
        boxShadow:pressed&&!disabled?"0 0 16px "+glowColor+",0 0 4px "+glowColor
          : variant==="primary"&&!disabled?"0 2px 8px rgba(46,107,79,0.2)":"none",
        transform:pressed&&!disabled?"scale(0.97)":"scale(1)",
        opacity:disabled?0.6:1,
      }}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// MODAL (bottom slide-up overlay)
// ─────────────────────────────────────────────
export function Modal({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,zIndex:500,background:"rgba(10,16,28,0.76)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn 0.2s ease",backdropFilter:"blur(2px)"}}>
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{background:C.bg,width:"100%",maxWidth:390,borderRadius:"14px 14px 0 0",padding:"20px 16px 32px",animation:"slideUp 0.25s ease",maxHeight:"85vh",overflowY:"auto",scrollbarWidth:"none",boxShadow:"0 -4px 32px rgba(0,0,0,0.2)"}}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INPUT FIELD — dark background (Auth)
// ─────────────────────────────────────────────
export function AuthField({ label, value, onChangeVal, placeholder, type="text" }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.18em",marginBottom:5}}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChangeVal(e.target.value)}
        placeholder={placeholder}
        style={{width:"100%",padding:"10px 13px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#c0d0e4",fontSize:13,letterSpacing:"0.1em",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ─────────────────────────────────────────────
// INPUT FIELD — light background (App)
// ─────────────────────────────────────────────
export function Field({ label, value, onChangeVal, placeholder, type="text" }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:8.5,color:C.txM,letterSpacing:"0.18em",marginBottom:5}}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChangeVal(e.target.value)}
        placeholder={placeholder}
        style={{width:"100%",padding:"10px 13px",background:C.card,border:"1px solid "+C.border,borderRadius:6,color:C.tx,fontSize:13,letterSpacing:"0.06em",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-SCREEN HEADER NAV
// ─────────────────────────────────────────────
export function SubScreenNav({ label, onBack }) {
  return (
    <div style={{background:C.navy,padding:"0 0 0 0",borderBottom:"1px solid rgba(46,107,79,0.35)",marginBottom:0}}>
      <div style={{display:"flex",alignItems:"center",gap:0}}>
        <button
          onClick={onBack}
          style={{background:"transparent",border:"none",color:"rgba(143,168,200,0.6)",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",padding:"12px 14px",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <span style={{fontSize:12,lineHeight:1}}>‹</span>
          <span>マイページ</span>
        </button>
        <div style={{flex:1,textAlign:"center",paddingRight:80}}>
          <span style={{fontSize:11,fontWeight:600,color:"#e4eaf4",letterSpacing:"0.12em"}}>{label}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GLOBAL CSS KEYFRAMES
// ─────────────────────────────────────────────
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
  html,body,#root{margin:0;padding:0;min-height:100vh;background:#0f1828;}
  *{box-sizing:border-box;}
  ::-webkit-scrollbar{width:0;}
  input,textarea{outline:none;box-sizing:border-box;}

  @keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slideUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
  @keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
  @keyframes cursorBlink{0%,100%{opacity:1;}50%{opacity:0;}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

  /* サイバーアニメ */
  @keyframes scanGlow{0%,100%{opacity:0.4;transform:translateX(-100%);}50%{opacity:1;transform:translateX(200%);}}
  @keyframes likeGlow{0%{box-shadow:0 0 0 0 rgba(77,220,130,0.7);}50%{box-shadow:0 0 18px 6px rgba(77,220,130,0.45);}100%{box-shadow:0 0 0 0 rgba(77,220,130,0);}}
  @keyframes followScan{0%{background-position:0% 0%;}100%{background-position:100% 0%;}}
  @keyframes gridPulse{0%,100%{opacity:0.03;}50%{opacity:0.06;}}
  @keyframes scanLine{0%{top:-4px;}100%{top:100%;}}
  @keyframes cyberFlicker{0%,94%,96%,100%{opacity:1;}95%{opacity:0.7;}}

  /* カード */
  .card{transition:transform 0.15s ease,box-shadow 0.15s ease;cursor:pointer;}
  .card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(46,107,79,0.12),0 0 0 1px rgba(46,107,79,0.08);}

  /* グロー付きカード */
  .card-glow{transition:all 0.2s;}
  .card-glow:hover{box-shadow:0 0 12px rgba(46,107,79,0.15),0 2px 12px rgba(0,0,0,0.08);}
`;
