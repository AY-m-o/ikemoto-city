import { useState, useRef } from "react";
import { C, BOARD_ITEMS_INIT, ASSIGN_LOGS, runSequence } from "./constants.js";
import { Stamp, SectionHead, LogTerminal, Btn, Modal } from "./components.jsx";

// ─────────────────────────────────────────────
// PROJECT ROOM（チャット画面）
// ─────────────────────────────────────────────
const DUMMY_MESSAGES = [
  { id:1, from:"Kento（起案者）", time:"09:12", text:"おはようございます。本プロジェクトへのご参加ありがとうございます。まず全体のスケジュールを共有します。", mine:false },
  { id:2, from:"Saki", time:"09:18", text:"よろしくお願いします！今週中にリファレンス集めを完了させる予定です。", mine:false },
  { id:3, from:"開発局員", time:"09:25", text:"了解しました。担当パートはグラフィック設計でよかったでしょうか？", mine:true },
  { id:4, from:"Kento（起案者）", time:"09:31", text:"はい、その通りです。第一回のフィードバック期限は来週水曜日なのでよろしくお願いします。", mine:false },
];

function ProjectRoom({ room, onBack, onNudge }) {
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
      <div style={{position:"fixed",bottom:56,left:"50%",transform:"translateX(-50%)",width:390,background:C.card,borderTop:"1px solid "+C.border,padding:"8px 12px",display:"flex",gap:8,alignItems:"flex-end",boxSizing:"border-box"}}>
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

// ─────────────────────────────────────────────
// PROJECT DETAIL（プロジェクト詳細ページ）
// ─────────────────────────────────────────────
function ProjectDetail({ item, onBack, onAssign, onRoom, onNudge, alreadyAssigned }) {
  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      {/* ヘッダーバナー */}
      <div style={{background:C.navy,padding:"14px 16px 16px",borderBottom:"1px solid rgba(46,107,79,0.3)"}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:"rgba(143,168,200,0.6)",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",padding:0,marginBottom:10}}>← 掲示板へ戻る</button>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          <span style={{background:item.status==="充足"?"rgba(100,100,120,0.4)":"rgba(46,107,79,0.25)",color:item.status==="充足"?"rgba(200,210,220,0.7)":"#3d8a65",fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>{item.status==="充足"?"充足・待機中":"アサイン受付中"}</span>
          <span style={{background:"rgba(255,255,255,0.08)",color:"rgba(143,168,200,0.6)",fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.1em"}}>{item.dept}</span>
          {alreadyAssigned && (
            <span style={{background:"rgba(46,107,79,0.3)",color:"#4caf7d",fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>参加中</span>
          )}
        </div>
        <div style={{fontSize:17,fontWeight:700,color:"#dde8f5",letterSpacing:"0.04em",lineHeight:1.35,marginBottom:6}}>{item.title}</div>
        <div style={{fontSize:8,color:"rgba(143,168,200,0.4)",letterSpacing:"0.16em"}}>{item.reg}</div>
      </div>

      <div style={{padding:"14px 14px 0"}}>
        {/* 概要 */}
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:7}}>PROJECT OVERVIEW</div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"12px 14px",marginBottom:14}}>
          <div style={{fontSize:9.5,color:C.txM,lineHeight:1.85,letterSpacing:"0.04em"}}>{item.desc || "概要情報なし"}</div>
        </div>

        {/* 必要スキル */}
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:7}}>REQUIRED SKILLS</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
          {item.skills.map(s => (
            <span key={s} style={{background:C.card,border:"1px solid "+C.border,color:C.txM,fontSize:9.5,padding:"5px 13px",borderRadius:20,letterSpacing:"0.06em",fontWeight:500}}>{s}</span>
          ))}
        </div>

        {/* 詳細情報 */}
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"12px 14px",marginBottom:14}}>
          {[["部署",item.dept],["起案者",item.lead],["空席数",item.seats+"名"],["ステータス",item.status]].map(([k,v]) => (
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.borderD}}>
              <span style={{fontSize:9,color:C.txL,letterSpacing:"0.08em"}}>{k}</span>
              <span style={{fontSize:9,color:C.tx,fontWeight:600,letterSpacing:"0.06em"}}>{v}</span>
            </div>
          ))}
        </div>

        {/* アクション：自分がアサイン済みの場合のみルームへ。充足済み（未アサイン）は導線なし */}
        {alreadyAssigned ? (
          <Btn label="プロジェクトルームへ" onClick={() => onRoom(item)}/>
        ) : item.status !== "充足" ? (
          <Btn label="アサインを申請する" onClick={() => onAssign(item)}/>
        ) : (
          <div style={{background:C.bg,border:"1px solid "+C.borderD,borderRadius:7,padding:"11px 14px",marginBottom:8}}>
            <div style={{fontSize:9,color:C.txL,letterSpacing:"0.06em",textAlign:"center"}}>このプロジェクトは募集を締め切りました</div>
          </div>
        )}
        <div style={{height:8}}/>
        <Btn label="← 掲示板へ戻る" onClick={onBack} variant="ghost"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BOARD SCREEN（メイン）
// ─────────────────────────────────────────────
export default function BoardScreen({ onNudge }) {
  const [boardItems, setBoardItems] = useState(BOARD_ITEMS_INIT);
  // 自分がアサイン申請完了したプロジェクトのreg一覧
  const [assignedRegs, setAssignedRegs] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignPhase, setAssignPhase] = useState("form");
  const [assignLogs, setAssignLogs] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [projectRoom, setProjectRoom] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [innerTab, setInnerTab] = useState("board");
  // ② 通報機能
  const [reportTarget, setReportTarget] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const openReport = (e, label) => {
    e.stopPropagation();
    setReportTarget(label);
    setShowReport(true);
    setReportDone(false);
    setReportReason("");
  };

  if (projectRoom) {
    return <ProjectRoom room={projectRoom} onBack={() => { setProjectRoom(null); onNudge(); }} onNudge={onNudge}/>;
  }

  if (detailItem) {
    const live = boardItems.find(b => b.reg === detailItem.reg) || detailItem;
    const alreadyAssigned = assignedRegs.includes(live.reg);
    return (
      <ProjectDetail
        item={live}
        alreadyAssigned={alreadyAssigned}
        onBack={() => { setDetailItem(null); onNudge(); }}
        onAssign={(item) => {
          setDetailItem(null);
          setAssignTarget(item);
          setAssignPhase("form");
          setAssignLogs([]);
          setSelectedSkill("");
          setMessage("");
          onNudge();
        }}
        onRoom={(item) => { setDetailItem(null); setProjectRoom({ reg:item.reg, title:item.title }); onNudge(); }}
        onNudge={onNudge}
      />
    );
  }

  // ③ メッセージタブ: 自分がアサインしたプロジェクトのみ（充足済みは表示しない）
  const myAssignedProjects = boardItems.filter(b => assignedRegs.includes(b.reg) && b.status !== "充足");

  const openAssign = (item) => {
    setAssignTarget(item);
    setAssignPhase("form");
    setAssignLogs([]);
    setSelectedSkill("");
    setMessage("");
  };

  const runAssign = () => {
    setAssignPhase("running");
    runSequence(ASSIGN_LOGS, setAssignLogs, () => {
      setAssignPhase("done");
      // assignedRegs に追加
      setAssignedRegs(prev => prev.includes(assignTarget.reg) ? prev : [...prev, assignTarget.reg]);
      setBoardItems((prev) =>
        prev.map((it) =>
          it.reg === assignTarget.reg
            ? { ...it, seats: Math.max(0, it.seats-1), status: it.seats-1 <= 0 ? "充足" : "受付中" }
            : it
        )
      );
      // ① メッセージタブへ自動遷移
      setInnerTab("message");
    });
  };

  // 内部タブバー
  const InnerTabBar = () => (
    <div style={{display:"flex",borderBottom:"1px solid "+C.border,background:C.card}}>
      {[["board","掲示板"],["message","メッセージ"]].map(([id,label]) => (
        <button key={id} onClick={() => setInnerTab(id)}
          style={{flex:1,padding:"10px 0",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:9.5,letterSpacing:"0.08em",fontWeight:innerTab===id?600:400,color:innerTab===id?C.green:C.txL,borderBottom:innerTab===id?"2px solid "+C.green:"2px solid transparent",transition:"all 0.15s"}}>
          {label}{id==="message" && myAssignedProjects.length > 0 && (
            <span style={{marginLeft:5,background:C.green,color:"#fff",fontSize:7,padding:"1px 5px",borderRadius:10,fontWeight:700}}>{myAssignedProjects.length}</span>
          )}
        </button>
      ))}
    </div>
  );

  // メッセージタブ（① 自分がアサインしたプロジェクトのみ）
  if (innerTab === "message") {
    return (
      <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
        <InnerTabBar/>
        <div style={{padding:"14px 14px 0"}}>
          <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:10}}>MY PROJECT MESSAGES</div>
          {myAssignedProjects.length === 0 ? (
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"22px 16px",textAlign:"center"}}>
              <div style={{fontSize:9.5,color:C.txL,letterSpacing:"0.08em",marginBottom:6}}>参加中のプロジェクトルームはありません</div>
              <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em",lineHeight:1.7}}>掲示板からプロジェクトにアサイン申請すると<br/>こちらにメッセージルームが表示されます</div>
            </div>
          ) : (
            myAssignedProjects.map(p => (
              <div key={p.reg} onClick={() => { setProjectRoom({ reg:p.reg, title:p.title }); onNudge(); }}
                style={{background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"12px 14px",marginBottom:9,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:8,color:C.txL,letterSpacing:"0.12em"}}>{p.dept} / {p.reg}</div>
                  <span style={{background:"rgba(46,107,79,0.1)",color:C.green,fontSize:7.5,padding:"2px 7px",borderRadius:3,fontWeight:600}}>参加中</span>
                </div>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,letterSpacing:"0.03em",lineHeight:1.3,marginBottom:5}}>{p.title}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:8.5,color:C.txL}}>起案者：{p.lead}</div>
                  <span style={{fontSize:9,color:C.green,fontWeight:600}}>チャットへ →</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // 掲示板タブ
  return (
    <>
      <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
        <InnerTabBar/>
        <div style={{padding:"15px 14px 0"}}>
          <SectionHead accent={C.navy} label="共創掲示板" sub="Co-creation Board"/>
          <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"10px 13px",marginBottom:14}}>
            <div style={{fontSize:9.5,color:C.txM,lineHeight:1.75,letterSpacing:"0.04em"}}>
              本掲示板への参加は、スキルのアサイン（配属）によってのみ行われます。<br/>
              <span style={{color:C.txL}}>金銭の授受は発生しません。すべての従事は市民としての任意の意思決定に基づきます。</span>
            </div>
          </div>

          {boardItems.map((item) => {
            const assigned = assignedRegs.includes(item.reg);
            return (
              <div key={item.reg} className="card"
                onClick={() => { setDetailItem(item); onNudge(); }}
                style={{background:C.card,border:"1px solid "+(item.status==="充足"?C.borderD:C.border),borderRadius:8,padding:"12px 13px",marginBottom:9,position:"relative",overflow:"hidden",cursor:"pointer"}}>
                <Stamp/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <span style={{background:item.status==="充足"?"#eee":C.navy,color:item.status==="充足"?C.txL:"#e4eaf4",fontSize:8,padding:"2px 7px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>{item.dept}</span>
                    <span style={{background:item.status==="充足"?"#f0f0f0":"rgba(46,107,79,0.1)",color:item.status==="充足"?C.txL:C.green,fontSize:8,padding:"2px 7px",borderRadius:3,letterSpacing:"0.1em",fontWeight:500}}>
                      {item.status==="充足" ? "充足・待機中" : "アサイン受付中"}
                    </span>
                    {assigned && <span style={{background:"rgba(46,107,79,0.15)",color:"#4caf7d",fontSize:8,padding:"2px 7px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>参加中</span>}
                  </div>
                  <span style={{fontSize:8,color:C.txL,letterSpacing:"0.1em",flexShrink:0}}>{item.reg}</span>
                  {/* ② 通報ボタン */}
                  <button onClick={e => openReport(e, item.title)}
                    style={{background:"transparent",border:"none",color:C.txL+"99",fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1,flexShrink:0}}>
                    ⋯
                  </button>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:item.status==="充足"?C.txM:C.tx,marginBottom:7,lineHeight:1.35,letterSpacing:"0.03em"}}>{item.title}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
                  {item.skills.map((s) => (
                    <span key={s} style={{background:C.bg,border:"1px solid "+C.border,color:C.txM,fontSize:8.5,padding:"2px 9px",borderRadius:20,letterSpacing:"0.06em"}}>{s}</span>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:8.5,color:C.txL,letterSpacing:"0.05em"}}>起案者：{item.lead}　空席：{item.seats}名</span>
                  <span style={{color:C.txL,fontSize:12}}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {assignTarget && (
        <Modal onClose={() => { if (assignPhase !== "running") setAssignTarget(null); }}>
          <div style={{marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:4}}>アサイン申請</div>
              <div style={{fontSize:13,fontWeight:700,color:C.tx,lineHeight:1.35}}>{assignTarget.title}</div>
            </div>
            {assignPhase !== "running" && (
              <button onClick={() => setAssignTarget(null)} style={{background:"transparent",border:"none",color:C.txL,fontSize:18,cursor:"pointer",lineHeight:1,padding:0}}>✕</button>
            )}
          </div>

          {assignPhase === "form" && (
            <>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:8.5,color:C.txM,letterSpacing:"0.18em",marginBottom:7}}>担当スキルを選択</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {assignTarget.skills.map((s) => (
                    <button key={s} onClick={() => setSelectedSkill(s)} style={{padding:"5px 13px",background:selectedSkill===s?C.navy:"transparent",border:"1px solid "+(selectedSkill===s?C.navy:C.border),borderRadius:20,color:selectedSkill===s?"#e4eaf4":C.txM,fontSize:9.5,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.06em"}}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:8.5,color:C.txM,letterSpacing:"0.18em",marginBottom:5}}>メッセージ（任意）</div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="活動実績や意欲など、起案者へのメッセージ" rows={3} style={{width:"100%",padding:"10px 13px",background:C.card,border:"1px solid "+C.border,borderRadius:6,color:C.tx,fontSize:12,fontFamily:"inherit",outline:"none",resize:"none",letterSpacing:"0.04em",lineHeight:1.7,boxSizing:"border-box"}}/>
              </div>
              <div style={{background:"rgba(46,107,79,0.07)",border:"1px solid rgba(46,107,79,0.2)",borderRadius:6,padding:"9px 12px",marginBottom:14}}>
                <div style={{fontSize:8.5,color:C.txM,letterSpacing:"0.04em",lineHeight:1.7}}>申請後、起案者による承認が行われます。承認結果は市民活動ログに記録されます。</div>
              </div>
              <Btn label="アサインを申請する" onClick={runAssign} disabled={!selectedSkill}/>
            </>
          )}

          {(assignPhase === "running" || assignPhase === "done") && (
            <LogTerminal logs={assignLogs} running={assignPhase === "running"} dark={false}/>
          )}

          {assignPhase === "done" && (
            <>
              <div style={{background:"rgba(0,255,136,0.07)",border:"1px solid rgba(0,255,136,0.3)",borderRadius:7,padding:"11px 13px",marginBottom:12}}>
                <div style={{fontSize:10,color:C.green,fontWeight:700,letterSpacing:"0.08em",marginBottom:2}}>申請が完了しました</div>
                <div style={{fontSize:9,color:C.txM,letterSpacing:"0.04em",lineHeight:1.7}}>メッセージタブに自動遷移します。</div>
              </div>
              <Btn label="プロジェクトルームへ" onClick={() => {
                const reg = assignTarget.reg;
                const title = assignTarget.title;
                setAssignTarget(null);
                setProjectRoom({ reg, title });
                onNudge();
              }}/>
              <div style={{height:8}}/>
              <Btn label="閉じる" onClick={() => setAssignTarget(null)} variant="ghost"/>
            </>
          )}
        </Modal>
      )}

      {/* ② 通報モーダル */}
      {showReport && (
        <Modal onClose={() => setShowReport(false)}>
          {!reportDone ? (
            <>
              <div style={{fontSize:12,fontWeight:700,color:C.tx,marginBottom:4}}>通報</div>
              <div style={{fontSize:8.5,color:C.txL,marginBottom:14,letterSpacing:"0.04em",lineHeight:1.6}}>『{reportTarget}』を通報する理由を選択してください</div>
              {["スパム","不適切なコンテンツ","規約違反","その他"].map(reason => (
                <div key={reason} onClick={() => setReportReason(reason)}
                  style={{padding:"11px 13px",borderRadius:7,marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10,background:reportReason===reason?"rgba(46,107,79,0.15)":C.bg,border:"1px solid "+(reportReason===reason?"rgba(46,107,79,0.4)":C.border),transition:"all 0.15s"}}>
                  <div style={{width:14,height:14,borderRadius:"50%",border:"1.5px solid "+(reportReason===reason?C.green:C.txL),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {reportReason===reason && <div style={{width:7,height:7,borderRadius:"50%",background:C.green}}/>}
                  </div>
                  <span style={{fontSize:10,color:C.tx}}>{reason}</span>
                </div>
              ))}
              <div style={{marginTop:10,display:"flex",gap:8}}>
                <button onClick={() => setShowReport(false)} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid "+C.border,borderRadius:7,color:C.txL,fontSize:9.5,cursor:"pointer",fontFamily:"inherit"}}>キャンセル</button>
                <button onClick={() => { if(reportReason) setReportDone(true); }} style={{flex:1,padding:"9px",background:reportReason?C.green:"rgba(46,107,79,0.25)",border:"none",borderRadius:7,color:"#fff",fontSize:9.5,fontWeight:600,cursor:reportReason?"pointer":"default",fontFamily:"inherit",transition:"background 0.2s"}}>送信する</button>
              </div>
            </>
          ) : (
            <div style={{textAlign:"center",padding:"10px 0"}}>
              <div style={{fontSize:18,marginBottom:8,color:C.green}}>&#x2713;</div>
              <div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:5}}>通報を受付けました</div>
              <div style={{fontSize:9,color:C.txL,lineHeight:1.7}}>24時間中に運営が対応いたします。</div>
              <button onClick={() => setShowReport(false)} style={{marginTop:14,padding:"8px 24px",background:C.green,border:"none",borderRadius:7,color:"#fff",fontSize:9.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>閉じる</button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
