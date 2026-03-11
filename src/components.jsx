import { useRef, useEffect } from "react";
import { C } from "./constants.js";

// ─────────────────────────────────────────────
// TICKER
// ─────────────────────────────────────────────
export function Ticker({ text }) {
  return (
    <div style={{background:C.green,padding:"4px 0",overflow:"hidden",fontSize:9,color:"rgba(255,255,255,0.88)",letterSpacing:"0.12em",whiteSpace:"nowrap"}}>
      <span style={{animation:"ticker 44s linear infinite",display:"inline-block"}}>　{text}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// APPROVED STAMP
// ─────────────────────────────────────────────
export function Stamp() {
  return (
    <div style={{position:"absolute",bottom:7,right:9,border:"1px solid rgba(46,107,79,0.14)",borderRadius:2,padding:"1px 4px",transform:"rotate(-7deg)",pointerEvents:"none"}}>
      <span style={{fontSize:6.5,fontWeight:700,letterSpacing:"0.18em",color:"rgba(46,107,79,0.18)"}}>APPROVED</span>
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
      <div style={{width:2.5,height:13,background:accent||C.navy,borderRadius:2,flexShrink:0}}/>
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
    <div ref={ref} style={{background:dark?"#07101a":"#f0f4f8",border:"1px solid "+(dark?"rgba(46,107,79,0.3)":C.border),borderRadius:6,padding:"11px 13px",marginBottom:16,height:148,overflowY:"auto",scrollbarWidth:"none",fontFamily:"'SF Mono','Fira Mono',monospace",fontSize:9.5,lineHeight:1.9,letterSpacing:"0.03em"}}>
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
// BUTTON
// ─────────────────────────────────────────────
export function Btn({ label, onClick, variant="primary", small=false, disabled=false }) {
  const bg  = variant==="primary"?C.green : variant==="navy"?C.navy : variant==="danger"?C.red : "transparent";
  const col = variant==="ghost" ? C.txM : "#fff";
  const bdr = variant==="ghost" ? "1px solid "+C.border : "none";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{padding:small?"6px 14px":"11px 0",width:small?"auto":"100%",background:disabled?"rgba(46,107,79,0.2)":bg,border:bdr,borderRadius:6,color:disabled?"rgba(255,255,255,0.35)":col,fontSize:small?9:10,fontWeight:600,letterSpacing:"0.12em",cursor:disabled?"default":"pointer",fontFamily:"inherit",transition:"opacity 0.15s"}}
      onMouseEnter={(e)=>{ if(!disabled) e.currentTarget.style.opacity="0.82"; }}
      onMouseLeave={(e)=>{ e.currentTarget.style.opacity="1"; }}>
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
      style={{position:"fixed",inset:0,zIndex:500,background:"rgba(10,16,28,0.72)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn 0.2s ease"}}>
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{background:C.bg,width:"100%",maxWidth:390,borderRadius:"14px 14px 0 0",padding:"20px 16px 32px",animation:"slideUp 0.25s ease",maxHeight:"85vh",overflowY:"auto",scrollbarWidth:"none"}}>
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
// SUB-SCREEN HEADER NAV (replaces plain back button)
// Used by Settings / Inquiry / Logout sub-screens
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
// GLOBAL CSS KEYFRAMES (inject once at root)
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
  .card{transition:transform 0.15s ease,box-shadow 0.15s ease;cursor:pointer;}
  .card:hover{transform:translateY(-2px);box-shadow:0 5px 18px rgba(26,37,64,0.1);}
`;
