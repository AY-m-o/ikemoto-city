import { useRef, useEffect, useState } from "react";
import { useTheme } from "./ThemeContext.jsx";

// ─────────────────────────────────────────────
// CYBER TICKER
// ─────────────────────────────────────────────
export function Ticker({ text }) {
  const C = useTheme();
  return (
    <div style={{
      background:"#000000",
      borderBottom:"1px solid rgba(0,255,136,0.3)",
      padding:"5px 0",
      overflow:"hidden",
      position:"relative",
    }}>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(0,255,136,0.04),transparent)",animation:"scanGlow 4s ease-in-out infinite",pointerEvents:"none"}}/>
      <span style={{
        animation:"ticker 36s linear infinite",
        display:"inline-block",
        fontFamily:"'SF Mono','Fira Mono','Courier New',monospace",
        fontSize:9,
        letterSpacing:"0.18em",
        color:C.green,
        textShadow:"0 0 8px #00ff88",
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
    <div style={{position:"absolute",bottom:7,right:9,border:"1px solid rgba(0,255,136,0.2)",borderRadius:2,padding:"1px 5px",transform:"rotate(-7deg)",pointerEvents:"none"}}>
      <span style={{fontSize:6.5,fontWeight:700,letterSpacing:"0.18em",color:"rgba(0,255,136,0.25)",textShadow:"0 0 4px rgba(0,255,136,0.2)"}}>APPROVED</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// WATERMARK (rotated citizen ID)
// ─────────────────────────────────────────────
export function Watermark({ id }) {
  return (
    <div style={{position:"fixed",bottom:78,right:0,zIndex:40,transform:"rotate(-90deg)",transformOrigin:"right center",pointerEvents:"none",userSelect:"none"}}>
      <span style={{fontSize:8,color:"rgba(0,255,136,0.06)",letterSpacing:"0.2em",fontWeight:700,whiteSpace:"nowrap"}}>{id||"IK-2026-████"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// RR COUNTER
// ─────────────────────────────────────────────
export function RR({ value }) {
  return (
    <div style={{position:"fixed",bottom:78,left:11,zIndex:40,pointerEvents:"none"}}>
      <div style={{fontSize:7,color:"rgba(0,255,136,0.2)",letterSpacing:"0.14em",marginBottom:1,fontFamily:"monospace"}}>RR</div>
      <div style={{fontSize:10,color:"rgba(0,255,136,0.18)",fontWeight:700,letterSpacing:"0.1em",fontVariantNumeric:"tabular-nums",fontFamily:"monospace"}}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
export function SectionHead({ accent, label, sub }) {
  const C = useTheme();
  const col = accent || C.green;
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
      <div style={{width:2.5,height:18,background:col,borderRadius:2,flexShrink:0,boxShadow:"0 0 14px "+col}}/>
      <span style={{fontSize:11,color:C.txM,letterSpacing:"0.24em",fontWeight:800,textTransform:"uppercase",textShadow:"0 0 8px rgba(255,255,255,0.08)"}}>{label}</span>
      {sub&&<span style={{fontSize:8,color:C.txL,letterSpacing:"0.1em",fontWeight:400}}>{sub}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// LOG TERMINAL
// ─────────────────────────────────────────────
export function LogTerminal({ logs, running, dark=true }) {
  const C = useTheme();
  const ref = useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.scrollTop=ref.current.scrollHeight; },[logs]);

  const isSuccess = (s) =>
    s.includes("サポート") || s.includes("完了") || s.includes("承認") ||
    s.includes("記録されました") || s.includes("受理されました") ||
    s.includes("終了しました") || s.includes("公開されました");

  const getColor = (s) => dark
    ? (isSuccess(s) ? "#00ff88" : "#2a5040")
    : (isSuccess(s) ? C.green   : C.txM);

  const getPrefix = (s) => isSuccess(s) ? "" : "> ";

  return (
    <div ref={ref} style={{background:dark?"#060b15":"#111827",border:"1px solid "+(dark?"rgba(0,255,136,0.2)":C.border),borderRadius:8,padding:"12px 14px",marginBottom:16,height:148,overflowY:"auto",scrollbarWidth:"none",fontFamily:"'SF Mono','Fira Mono',monospace",fontSize:9.5,lineHeight:1.9,letterSpacing:"0.03em",boxShadow:dark?"inset 0 0 24px rgba(0,0,0,0.5)":"none"}}>
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
      {running && <span style={{animation:"cursorBlink 0.7s infinite",color:C.green,textShadow:"0 0 6px #00ff88"}}>▋</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// BUTTON — primary: #00ff88 + glow
// ─────────────────────────────────────────────
export function Btn({ label, onClick, variant="primary", small=false, disabled=false }) {
  const C = useTheme();
  const [pressed, setPressed] = useState(false);

  // ライトモードのprimaryボタンは黒背景・白文字
  const bp = C.btnPrimary;
  const styles = {
    primary: bp ? {
      bg: bp.bg,
      color: bp.color,
      border: bp.border || "none",
      shadow: bp.shadow,
      shadowPress: bp.shadowPress,
      borderRadius: bp.borderRadius || 14,
    } : {
      bg: "transparent",
      color: "#00ff88",
      border: "1px solid #00ff88",
      shadow: "0 0 12px rgba(0,255,136,0.3),inset 0 0 12px rgba(0,255,136,0.04)",
      shadowPress: "0 0 24px rgba(0,255,136,0.6),inset 0 0 16px rgba(0,255,136,0.1)",
      borderRadius: 7,
    },
    navy: {
      bg: C.navyL,
      color: C.tx,
      border: "1px solid "+C.border,
      shadow: "none",
      shadowPress: bp ? "0 4px 16px rgba(0,0,0,0.2)" : "0 0 12px rgba(0,255,136,0.2)",
      borderRadius: bp ? 14 : 7,
    },
    danger: {
      bg: "transparent",
      color: C.red,
      border: "1px solid "+C.red,
      shadow: "none",
      shadowPress: "0 0 12px rgba(192,57,43,0.4)",
      borderRadius: 7,
    },
    ghost: {
      bg: "transparent",
      color: C.txM,
      border: "1px solid "+C.border,
      shadow: "none",
      shadowPress: "none",
      borderRadius: 7,
    },
  };
  const s = styles[variant] || styles.primary;
  const disabledBg    = bp ? "rgba(0,0,0,0.08)" : "rgba(0,255,136,0.04)";
  const disabledBorder = bp ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(0,255,136,0.12)";
  const disabledColor  = bp ? "rgba(0,0,0,0.25)" : "rgba(0,255,136,0.25)";

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
        padding:small?"9px 20px":"14px 0",
        width:small?"auto":"100%",
        background:disabled?disabledBg:s.bg,
        border:disabled?disabledBorder:s.border,
        borderRadius:s.borderRadius||7,
        color:disabled?disabledColor:s.color,
        fontSize:small?9:10,
        fontWeight:700,
        letterSpacing:"0.12em",
        textTransform:"uppercase",
        cursor:disabled?"default":"pointer",
        fontFamily:"inherit",
        transition:"all 0.15s",
        boxShadow:pressed&&!disabled ? s.shadowPress : (disabled?"none":s.shadow),
        transform:pressed&&!disabled?"scale(0.97)":"scale(1)",
        textShadow:bp||(variant!=="primary")||disabled?"none":"0 0 10px rgba(0,255,136,0.7)",
      }}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// MODAL (bottom slide-up overlay)
// ─────────────────────────────────────────────
export function Modal({ children, onClose }) {
  const C = useTheme();
  return (
    <div
      onClick={onClose}
      style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,background:"rgba(6,11,21,0.88)",animation:"fadeIn 0.2s ease",backdropFilter:"blur(6px)"}}>
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{...C.glass,background:C.card,width:"calc(100% - 32px)",maxWidth:374,borderRadius:16,padding:"22px 18px 24px",animation:"slideUp 0.25s ease",maxHeight:"88vh",overflowY:"auto",scrollbarWidth:"none",border:"1px solid rgba(0,255,136,0.18)",boxShadow:"0 8px 48px rgba(0,0,0,0.6),0 0 0 1px rgba(0,255,136,0.06)"}}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INPUT FIELD — dark background (Auth)
// ─────────────────────────────────────────────
export function AuthField({ label, value, onChangeVal, placeholder, type="text" }) {
  const C = useTheme();
  return (
    <div style={{marginBottom:13}}>
      <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.2em",marginBottom:6,textTransform:"uppercase"}}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChangeVal(e.target.value)}
        placeholder={placeholder}
        style={{width:"100%",padding:"11px 14px",background:"rgba(0,255,136,0.03)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:8,color:C.tx,fontSize:13,letterSpacing:"0.08em",fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}
        onFocus={e=>e.target.style.borderColor="rgba(0,255,136,0.5)"}
        onBlur={e=>e.target.style.borderColor="rgba(0,255,136,0.15)"}
        />
    </div>
  );
}

// ─────────────────────────────────────────────
// INPUT FIELD — dark background (App)
// ─────────────────────────────────────────────
export function Field({ label, value, onChangeVal, placeholder, type="text" }) {
  const C = useTheme();
  return (
    <div style={{marginBottom:13}}>
      <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.2em",marginBottom:6,textTransform:"uppercase"}}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChangeVal(e.target.value)}
        placeholder={placeholder}
        style={{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid "+C.border,borderRadius:8,color:C.tx,fontSize:13,letterSpacing:"0.06em",fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}
        onFocus={e=>e.target.style.borderColor="rgba(0,255,136,0.4)"}
        onBlur={e=>e.target.style.borderColor=C.border}
        />
    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-SCREEN HEADER NAV
// ─────────────────────────────────────────────
export function SubScreenNav({ label, onBack, backLabel = "マイページ" }) {
  const C = useTheme();
  return (
    <div style={{background:C.navy,padding:"0",borderBottom:"1px solid rgba(0,255,136,0.15)",marginBottom:0}}>
      <div style={{display:"flex",alignItems:"center",gap:0}}>
        <button
          onClick={onBack}
          style={{background:"transparent",border:"none",color:C.txL,fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",padding:"12px 14px",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <span style={{fontSize:12,lineHeight:1}}>‹</span>
          <span>{backLabel}</span>
        </button>
        <div style={{flex:1,textAlign:"center",paddingRight:80}}>
          <span style={{fontSize:11,fontWeight:700,color:C.tx,letterSpacing:"0.14em"}}>{label}</span>
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
  html,body,#root{margin:0;padding:0;min-height:100vh;background:#0a0f1e;}
  *{box-sizing:border-box;}
  ::-webkit-scrollbar{width:0;}
  input,textarea{outline:none;box-sizing:border-box;}
  ::placeholder{color:rgba(75,85,99,0.7);}

  @keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slideUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
  @keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
  @keyframes cursorBlink{0%,100%{opacity:1;}50%{opacity:0;}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes scanGlow{0%,100%{opacity:0;transform:translateX(-100%);}50%{opacity:1;transform:translateX(300%);}}
  @keyframes likeGlow{0%{box-shadow:0 0 0 0 rgba(0,255,136,0.7);}50%{box-shadow:0 0 20px 6px rgba(0,255,136,0.4);}100%{box-shadow:0 0 0 0 rgba(0,255,136,0);}}
  @keyframes gridPulse{0%,100%{opacity:0.25;}50%{opacity:0.45;}}
  @keyframes borderPulse{0%,100%{box-shadow:0 0 6px rgba(0,255,136,0.3);}50%{box-shadow:0 0 16px rgba(0,255,136,0.7);}}
  @keyframes scanLine{0%{top:-4px;}100%{top:100%;}}
  @keyframes cyberFlicker{0%,94%,96%,100%{opacity:1;}95%{opacity:0.75;}}

  /* カード base — 深いシャドウ＋繊細なボーダー */
  .card{
    transition:all 0.22s ease;
    cursor:pointer;
    border-radius:12px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    border:1px solid rgba(255,255,255,0.06)!important;
  }
  .card:hover{
    border-color:rgba(0,255,136,0.4)!important;
    box-shadow:0 14px 44px rgba(0,0,0,0.6),0 0 24px rgba(0,255,136,0.12)!important;
    transform:translateY(-3px);
  }

  /* ⑦ カード押し込み */
  .pressable{
    transition:transform 0.12s ease, box-shadow 0.12s ease;
    cursor:pointer;
  }
  .pressable:active{
    transform:scale(0.98)!important;
    box-shadow:0 2px 12px rgba(0,0,0,0.5)!important;
  }

  /* ⑤ 画面遷移フェード */
  @keyframes screenFade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
  .screen-fade{animation:screenFade 0.2s ease-out both;}

  /* ⑥ すりガラスヘッダー */
  .glass-header{
    backdrop-filter:blur(12px) saturate(180%);
    -webkit-backdrop-filter:blur(12px) saturate(180%);
    background:rgba(10,15,30,0.75)!important;
  }

  /* フォロー中ボーダーパルス */
  .follow-active{animation:borderPulse 2s ease-in-out infinite;}

  /* ⑧ 等幅数字 */
  .mono{font-family:'SF Mono','Fira Mono','Courier New',monospace;}

  /* リキッドグラスタブバー */
  .liq-nav{position:relative;isolation:isolate;}
  .liq-nav::before{
    content:"";position:absolute;inset:0;border-radius:inherit;
    background:linear-gradient(to bottom,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0) 55%);
    pointer-events:none;z-index:1;
  }
  .liq-nav::after{
    content:"";position:absolute;inset:0;border-radius:inherit;
    background:radial-gradient(circle at var(--gx,50%) var(--gy,-20%),rgba(255,255,255,0.38) 0%,transparent 60%);
    pointer-events:none;z-index:2;transition:background 0.12s ease;
  }
  .liq-nav>*{position:relative;z-index:3;}

  /* ─── ライトモード全体 ─── */
  body.ik-light{background:#ffffff!important;color:#000000!important;}

  /* ライトモード：.card疑似要素ガラス（コンテンツ保護） */
  body.ik-light .card{
    position:relative!important;
    isolation:isolate!important;
    background:transparent!important;
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
    border:none!important;
    border-radius:20px!important;
    box-shadow:0px 0px 21px -8px rgba(0,0,0,0.12)!important;
    overflow:visible!important;
  }
  /* ティント + インナーシャドウ + ボーダー層 */
  body.ik-light .card::before{
    content:"";position:absolute;inset:0;z-index:0;
    border-radius:20px;
    background:rgba(255,255,255,0.15);
    border:1px solid rgba(255,255,255,0.75);
    box-shadow:inset 0 0 10px -6px rgba(255,255,255,0.8),
               inset 0 1px 0 rgba(255,255,255,0.9);
    pointer-events:none;
  }
  /* backdrop-filter + distortion 背景層（コンテンツ非影響） */
  body.ik-light .card::after{
    content:"";position:absolute;inset:0;z-index:-1;
    border-radius:20px;
    backdrop-filter:blur(8px) saturate(180%);
    -webkit-backdrop-filter:blur(8px) saturate(180%);
    filter:url(#glass-distortion);
    isolation:isolate;
    pointer-events:none;
  }
  /* カード内の直接コンテンツを疑似要素より前面に */
  body.ik-light .card>*{position:relative;z-index:1;}
  body.ik-light .card:hover::before{
    background:rgba(255,255,255,0.22);
    border-color:rgba(255,255,255,0.9);
  }
  body.ik-light .card:hover{transform:translateY(-2px);}

  /* ライトモード：グリーン色を黒に上書き */
  body.ik-light .follow-active{animation:none!important;border-color:rgba(0,0,0,0.2)!important;}
  body.ik-light ::placeholder{color:rgba(0,0,0,0.3)!important;}
`;
