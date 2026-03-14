import { useState } from "react";
import { C, BOARD_ITEMS_INIT, ASSIGN_LOGS, runSequence } from "./constants.js";
import { Stamp, SectionHead, LogTerminal, Btn, Modal } from "./components.jsx";
import { useI18n } from "./i18n.js";
import MessageRoom from "./MessageRoom.jsx";

// ─────────────────────────────────────────────
// PROJECT DETAIL（プロジェクト詳細）
// ─────────────────────────────────────────────
function ProjectDetail({ item, onBack, onAssign, onRoom, onNudge, alreadyAssigned }) {
  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      <div style={{background:C.navy,padding:"14px 16px 16px",borderBottom:"1px solid rgba(46,107,79,0.3)"}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:"rgba(143,168,200,0.6)",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",padding:0,marginBottom:10}}>← 掲示板へ戻る</button>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          <span style={{background:item.status==="充足"?"rgba(100,100,120,0.4)":"rgba(46,107,79,0.25)",color:item.status==="充足"?"rgba(200,210,220,0.7)":"#3d8a65",fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>{item.status==="充足"?"充足・待機中":"参加申請受付中"}</span>
          <span style={{background:"rgba(255,255,255,0.08)",color:"rgba(143,168,200,0.6)",fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.1em"}}>{item.dept}</span>
          {alreadyAssigned && (
            <span style={{background:"rgba(46,107,79,0.3)",color:"#4caf7d",fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>参加中</span>
          )}
        </div>
        <div style={{fontSize:17,fontWeight:700,color:"#dde8f5",letterSpacing:"0.04em",lineHeight:1.35,marginBottom:6}}>{item.title}</div>
        <div style={{fontSize:8,color:"rgba(143,168,200,0.4)",letterSpacing:"0.16em"}}>{item.reg}</div>
      </div>

      <div style={{padding:"14px 14px 0"}}>
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:7}}>PROJECT OVERVIEW</div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"12px 14px",marginBottom:14}}>
          <div style={{fontSize:9.5,color:C.txM,lineHeight:1.85,letterSpacing:"0.04em"}}>{item.desc || "概要情報なし"}</div>
        </div>

        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:7}}>REQUIRED SKILLS</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
          {item.skills.map(s => (
            <span key={s} style={{background:C.card,border:"1px solid "+C.border,color:C.txM,fontSize:9.5,padding:"5px 13px",borderRadius:20,letterSpacing:"0.06em",fontWeight:500}}>{s}</span>
          ))}
        </div>

        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"12px 14px",marginBottom:14}}>
          {[["部署",item.dept],["起案者",item.lead],["空席数",item.seats+"名"],["ステータス",item.status]].map(([k,v]) => (
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.borderD}}>
              <span style={{fontSize:9,color:C.txL,letterSpacing:"0.08em"}}>{k}</span>
              <span style={{fontSize:9,color:C.tx,fontWeight:600,letterSpacing:"0.06em"}}>{v}</span>
            </div>
          ))}
        </div>

        {alreadyAssigned ? (
          <Btn label="プロジェクトルームへ" onClick={() => onRoom(item)}/>
        ) : item.status !== "充足" ? (
          <Btn label="参加申請する" onClick={() => onAssign(item)}/>
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
// BOARD（掲示板メイン）
// ─────────────────────────────────────────────
export default function Board({ onNudge, lang, citizenId }) {
  const t = useI18n(lang);
  const [boardItems, setBoardItems] = useState(BOARD_ITEMS_INIT);
  const [assignedRegs, setAssignedRegs] = useState([]);
  const [pendingRegs, setPendingRegs]   = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignPhase, setAssignPhase] = useState("form");
  const [assignLogs, setAssignLogs] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [projectRoom, setProjectRoom] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [innerTab, setInnerTab] = useState("board");
  const [reportTarget, setReportTarget] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [authChecking, setAuthChecking] = useState(false);
  const [authTarget, setAuthTarget]     = useState(null);

  const isLeadOf = (reg) => {
    const item = boardItems.find(b => b.reg === reg);
    return !!(item && citizenId && citizenId === item.leadId);
  };

  const handleCardTap = (item) => {
    setAuthChecking(true);
    setAuthTarget(item);
    setTimeout(() => {
      setAuthChecking(false);
      setAuthTarget(null);
      setDetailItem(item);
      onNudge();
    }, 500);
  };

  const openReport = (e, label) => {
    e.stopPropagation();
    setReportTarget(label);
    setShowReport(true);
    setReportDone(false);
    setReportReason("");
  };

  if (projectRoom) {
    return <MessageRoom room={projectRoom} onBack={() => { setProjectRoom(null); onNudge(); }} onNudge={onNudge}/>;
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

  const myAssignedProjects = boardItems.filter(b => assignedRegs.includes(b.reg));
  const myPendingProjects  = boardItems.filter(b => pendingRegs.includes(b.reg));
  const totalMsgBadge = myAssignedProjects.length + myPendingProjects.length;

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
      setPendingRegs(prev => prev.includes(assignTarget.reg) ? prev : [...prev, assignTarget.reg]);
      setAssignPhase("done");
      setTimeout(() => {
        setAssignTarget(null);
        setInnerTab("message");
        onNudge();
      }, 1500);
    });
  };

  const approveAssign = (reg) => {
    setPendingRegs(prev => prev.filter(r => r !== reg));
    setAssignedRegs(prev => prev.includes(reg) ? prev : [...prev, reg]);
    setBoardItems(prev =>
      prev.map(it =>
        it.reg === reg
          ? { ...it, seats: Math.max(0, it.seats-1), status: it.seats-1 <= 0 ? "充足" : "受付中" }
          : it
      )
    );
    onNudge();
  };

  const rejectAssign = (reg) => {
    setPendingRegs(prev => prev.filter(r => r !== reg));
    onNudge();
  };

  const InnerTabBar = () => (
    <div style={{display:"flex",borderBottom:"1px solid "+C.border,background:C.card}}>
      {[["board", t.board_board_tab],["message", t.board_msg_tab]].map(([id,label]) => (
        <button key={id} onClick={() => setInnerTab(id)}
          style={{flex:1,padding:"10px 0",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:9.5,letterSpacing:"0.08em",fontWeight:innerTab===id?600:400,color:innerTab===id?C.green:C.txL,borderBottom:innerTab===id?"2px solid "+C.green:"2px solid transparent",transition:"all 0.15s"}}>
          {label}{id==="message" && totalMsgBadge > 0 && (
            <span style={{marginLeft:5,background:C.green,color:"#000",fontSize:7,padding:"1px 5px",borderRadius:10,fontWeight:700}}>{totalMsgBadge}</span>
          )}
        </button>
      ))}
    </div>
  );

  // メッセージタブ
  if (innerTab === "message") {
    return (
      <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
        <InnerTabBar/>
        <div style={{padding:"14px 14px 0"}}>
          {myPendingProjects.length > 0 && (
            <>
              <div style={{fontSize:8,color:"#ff9900",letterSpacing:"0.14em",marginBottom:10}}>PENDING APPROVAL — {myPendingProjects.length}件</div>
              {myPendingProjects.map(p => (
                <div key={p.reg} style={{background:"rgba(255,153,0,0.05)",border:"1px solid rgba(255,153,0,0.3)",borderLeft:"3px solid #ff9900",borderRadius:8,padding:"12px 14px",marginBottom:9}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div className="mono" style={{fontSize:8,color:"rgba(255,153,0,0.6)",letterSpacing:"0.12em"}}>{p.dept} / {p.reg}</div>
                    <span style={{background:"rgba(255,153,0,0.15)",color:"#ff9900",fontSize:7.5,padding:"2px 8px",borderRadius:3,fontWeight:700}}>
                      {isLeadOf(p.reg) ? "承認待ち（起案者）" : "承認待ち"}
                    </span>
                  </div>
                  <div style={{fontSize:11,fontWeight:600,color:C.tx,letterSpacing:"0.03em",lineHeight:1.3,marginBottom:6}}>{p.title}</div>
                  {isLeadOf(p.reg) ? (
                    <>
                      <div style={{fontSize:8.5,color:"rgba(255,153,0,0.7)",marginBottom:10}}>このプロジェクトへの申請が届いています。承認するとメッセージルームが開放されます。</div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={() => approveAssign(p.reg)}
                          style={{flex:1,padding:"9px",background:"rgba(0,255,136,0.15)",border:"1px solid rgba(0,255,136,0.4)",borderRadius:7,color:"#00ff88",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em",transition:"all 0.2s"}}>
                          承認する
                        </button>
                        <button onClick={() => rejectAssign(p.reg)}
                          style={{flex:1,padding:"9px",background:"rgba(255,68,85,0.1)",border:"1px solid rgba(255,68,85,0.35)",borderRadius:7,color:"#ff4455",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em",transition:"all 0.2s"}}>
                          却下する
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{fontSize:8.5,color:C.txM}}>起案者 {p.lead} が申請内容を確認しています。承認結果をお待ちください。</div>
                  )}
                </div>
              ))}
              {myAssignedProjects.length > 0 && <div style={{height:4}}/>}
            </>
          )}

          <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:10}}>{t.board_my_msg}</div>
          {myAssignedProjects.length === 0 && myPendingProjects.length === 0 ? (
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"22px 16px",textAlign:"center"}}>
              <div style={{fontSize:9.5,color:C.txL,letterSpacing:"0.08em",marginBottom:6}}>{t.board_no_room}</div>
              <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em",lineHeight:1.7}}>{t.board_no_room_sub}</div>
            </div>
          ) : (
            myAssignedProjects.map(p => (
              <div key={p.reg} className="pressable" onClick={() => { setProjectRoom({ reg:p.reg, title:p.title }); onNudge(); }}
                style={{background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"12px 14px",marginBottom:9,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div className="mono" style={{fontSize:8,color:C.txL,letterSpacing:"0.12em"}}>{p.dept} / {p.reg}</div>
                  <span style={{background:"rgba(0,255,136,0.1)",color:C.green,fontSize:7.5,padding:"2px 7px",borderRadius:3,fontWeight:600}}>参加中</span>
                </div>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,letterSpacing:"0.03em",lineHeight:1.3,marginBottom:5}}>{p.title}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:8.5,color:C.txL}}>起案者：{p.lead}</div>
                  <span style={{fontSize:9,color:C.green,fontWeight:600}}>{t.board_chat_to}</span>
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
          <SectionHead accent={C.navy} label={t.board_title} sub={t.board_sub}/>
          <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"10px 13px",marginBottom:14}}>
            <div style={{fontSize:9.5,color:C.txM,lineHeight:1.75,letterSpacing:"0.04em"}}>{t.board_note}</div>
          </div>

          {boardItems.map((item) => {
            const assigned = assignedRegs.includes(item.reg);
            return (
              <div key={item.reg} className="card"
                onClick={() => handleCardTap(item)}
                style={{background:C.card,border:"1px solid "+(item.status==="充足"?C.borderD:C.border),borderRadius:8,padding:"12px 13px",marginBottom:9,position:"relative",overflow:"hidden",cursor:"pointer"}}>
                {authChecking && authTarget?.reg===item.reg && (
                  <div style={{position:"absolute",inset:0,background:"rgba(0,10,6,0.85)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,backdropFilter:"blur(2px)"}}>
                    <div style={{fontFamily:"monospace",fontSize:9,color:"#00ff88",letterSpacing:"0.14em",textShadow:"0 0 8px rgba(0,255,136,0.6)",animation:"cursorBlink 0.5s infinite"}}>認証コード確認中…</div>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <span style={{background:item.status==="充足"?"#eee":C.navy,color:item.status==="充足"?C.txL:"#e4eaf4",fontSize:8,padding:"2px 7px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>{item.dept}</span>
                    <span style={{background:item.status==="充足"?"#f0f0f0":"rgba(46,107,79,0.1)",color:item.status==="充足"?C.txL:C.green,fontSize:8,padding:"2px 7px",borderRadius:3,letterSpacing:"0.1em",fontWeight:500}}>
                      {item.status==="充足" ? "充足・待機中" : "参加申請受付中"}
                    </span>
                    {assigned && <span style={{background:"rgba(46,107,79,0.15)",color:"#4caf7d",fontSize:8,padding:"2px 7px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>参加中</span>}
                  </div>
                  <span style={{fontSize:8,color:C.txL,letterSpacing:"0.1em",flexShrink:0}}>{item.reg}</span>
                  <button onClick={e => openReport(e, item.title)}
                    style={{background:"transparent",border:"none",color:C.txL+"99",fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
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
              <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:4}}>参加申請</div>
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
              <Btn label="参加申請する" onClick={runAssign} disabled={!selectedSkill}/>
            </>
          )}

          {(assignPhase === "running" || assignPhase === "done") && (
            <LogTerminal logs={assignLogs} running={assignPhase === "running"} dark={false}/>
          )}

          {assignPhase === "done" && (
            <>
              <div style={{background:"rgba(46,107,79,0.07)",border:"1px solid rgba(0,255,136,0.3)",borderRadius:7,padding:"11px 13px",marginBottom:12}}>
                <div style={{fontSize:9,color:C.green,fontWeight:600,letterSpacing:"0.1em",marginBottom:4}}>申請を受け付けました</div>
                <div style={{fontSize:8.5,color:C.txM,lineHeight:1.7}}>承認結果はメッセージタブに通知されます。</div>
              </div>
              <Btn label="メッセージタブで確認する" onClick={() => { setAssignTarget(null); setInnerTab("message"); }}/>
              <div style={{height:8}}/>
              <Btn label="閉じる" onClick={() => setAssignTarget(null)} variant="ghost"/>
            </>
          )}
        </Modal>
      )}

      {/* 通報モーダル */}
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
