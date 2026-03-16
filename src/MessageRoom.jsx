import { useState, useRef } from "react";
import { useTheme } from "./ThemeContext.jsx";
// constants imported;

// ─────────────────────────────────────────────
// MESSAGE ROOM（プロジェクトチャット）
// ─────────────────────────────────────────────
const DUMMY_MESSAGES = [
  { id:1, from:"Kento（起案者）", time:"09:12", text:"おはようございます。本プロジェクトへのご参加ありがとうございます。まず全体のスケジュールを共有します。", mine:false },
  { id:2, from:"Saki", time:"09:18", text:"よろしくお願いします！今週中にリファレンス集めを完了させる予定です。", mine:false },
  { id:3, from:"開発局員", time:"09:25", text:"了解しました。担当パートはグラフィック設計でよかったでしょうか？", mine:true },
  { id:4, from:"Kento（起案者）", time:"09:31", text:"はい、その通りです。第一回のフィードバック期限は来週水曜日なのでよろしくお願いします。", mine:false },
];

export default function MessageRoom({ room, onBack, onNudge }) {
  const C = useTheme();
  const [msgs, setMsgs] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { id:Date.now(), from:"開発局員", time:"今", text:input.trim(), mine:true }]);
    setInput("");
    onNudge();
    setTimeout(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior:"smooth" }); }, 50);
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",paddingBottom:72}}>
      {/* ヘッダー */}
      <div style={{background:C.navy,borderBottom:"1px solid rgba(46,107,79,0.3)",padding:"12px 14px"}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:"rgba(143,168,200,0.6)",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",padding:0,marginBottom:6}}>← 掲示板</button>
        <div style={{fontSize:7.5,color:"rgba(143,168,200,0.4)",letterSpacing:"0.18em",marginBottom:3}}>PROJECT ROOM</div>
        <div style={{fontSize:12,fontWeight:700,color:"#dde8f5",letterSpacing:"0.04em",lineHeight:1.35}}>{room.title}</div>
        <div style={{fontSize:8,color:"rgba(143,168,200,0.4)",letterSpacing:"0.1em",marginTop:3}}>{room.reg}</div>
      </div>

      {/* メッセージ一覧 */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 12px",background:C.bg}}>
        {msgs.map(m => (
          <div key={m.id} style={{marginBottom:14,display:"flex",flexDirection:"column",alignItems:m.mine?"flex-end":"flex-start"}}>
            {!m.mine && (
              <div style={{fontSize:8,color:C.txL,letterSpacing:"0.08em",marginBottom:3,marginLeft:2}}>{m.from}</div>
            )}
            <div style={{
              background:m.mine?C.navy:C.card,
              color:m.mine?"#dde8f5":C.tx,
              border:"1px solid "+(m.mine?"rgba(46,107,79,0.35)":C.border),
              borderRadius:m.mine?"10px 10px 3px 10px":"10px 10px 10px 3px",
              padding:"9px 11px",
              maxWidth:"80%",
              fontSize:10,
              lineHeight:1.65,
              letterSpacing:"0.03em",
            }}>{m.text}</div>
            <div style={{fontSize:7.5,color:C.txL,marginTop:3,marginLeft:2,marginRight:2}}>{m.time}</div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* 入力欄 */}
      <div style={{position:"fixed",bottom:56,left:"50%",transform:"translateX(-50%)",width:390,...C.glass,background:C.card,borderTop:"1px solid "+C.border,padding:"8px 12px",display:"flex",gap:8,alignItems:"flex-end",boxSizing:"border-box"}}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="メッセージを入力…"
          rows={1}
          style={{flex:1,resize:"none",border:"1px solid "+C.border,borderRadius:8,padding:"8px 10px",background:C.bg,color:C.tx,fontSize:10,fontFamily:"inherit",outline:"none",lineHeight:1.5,letterSpacing:"0.03em",maxHeight:80,overflowY:"auto"}}
        />
        <button onClick={send}
          style={{padding:"8px 14px",background:input.trim()?C.green:"rgba(46,107,79,0.3)",border:"none",borderRadius:8,color:"#fff",fontSize:9,fontWeight:600,cursor:input.trim()?"pointer":"default",fontFamily:"inherit",letterSpacing:"0.06em",flexShrink:0,transition:"background 0.2s"}}>
          送信
        </button>
      </div>
    </div>
  );
}
