import { useState, useEffect } from "react";
import { C, BOARD_ITEMS_INIT, ASSIGN_LOGS, DOMAINS, runSequence } from "./constants.js";
import { Stamp, SectionHead, LogTerminal, Btn, Modal } from "./components.jsx";
import { useI18n } from "./i18n.js";
import MessageRoom from "./MessageRoom.jsx";
import { supabase, fetchAssignments, insertAssignment, deleteAssignment, fetchProjects, createProject } from "./supabase.js";

// ─────────────────────────────────────────────
// PROJECT DETAIL（プロジェクト詳細）
// ─────────────────────────────────────────────
function ProjectDetail({ item, onBack, onAssign, onRoom, onNudge, alreadyAssigned, alreadyPending }) {
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
          {alreadyPending && !alreadyAssigned && (
            <span style={{background:"rgba(245,158,11,0.2)",color:"#f59e0b",fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>申請中</span>
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
        ) : alreadyPending ? (
          <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.35)",borderRadius:7,padding:"11px 14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:"#f59e0b"}}>◐</span>
                <div>
                  <div style={{fontSize:9.5,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>申請中</div>
                  <div style={{fontSize:8,color:"rgba(245,158,11,0.7)",letterSpacing:"0.04em",marginTop:2}}>起案者の承認をお待ちください</div>
                </div>
              </div>
              <button onClick={() => onCancel(item)}
                style={{padding:"6px 12px",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:6,color:"#ef4444",fontSize:8.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em",flexShrink:0}}>
                申請を取り消す
              </button>
            </div>
          </div>
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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentCitizenId, setCurrentCitizenId] = useState(citizenId || "");
  const [currentCitizenName, setCurrentCitizenName] = useState("");

  // プロジェクト作成フォーム state
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createSkills, setCreateSkills] = useState([]);
  const [createSeats, setCreateSeats] = useState(3);
  const [createDept, setCreateDept] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // ログイン済みユーザーの申請状況をSupabaseから取得
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      const meta = user.user_metadata || {};
      setCurrentCitizenId(meta.citizen_id || citizenId || "");
      setCurrentCitizenName(meta.citizen_name || "市民");

      // 申請状況を取得
      const rows = await fetchAssignments(user.id);
      const pending = [];
      const assigned = [];
      rows.forEach(r => {
        if (r.status === "active") assigned.push(r.project_id);
        else pending.push(r.project_id);
      });
      setAssignedRegs(assigned);
      setPendingRegs(pending);

      // Supabaseからプロジェクトを取得してBOARD_ITEMS_INITとマージ
      const dbProjects = await fetchProjects();
      if (dbProjects.length > 0) {
        const dbMapped = dbProjects.map(p => ({
          reg: p.reg, title: p.title, dept: p.dept || "建設局",
          lead: p.lead || "不明", leadId: p.lead_id || "",
          skills: p.skills || [], status: p.status || "受付中",
          seats: p.seats || 0, desc: p.desc || "",
        }));
        // 重複除外（同じregがあればデータベース側を優先）
        const dbRegs = new Set(dbMapped.map(p => p.reg));
        const filtered = BOARD_ITEMS_INIT.filter(b => !dbRegs.has(b.reg));
        setBoardItems([...dbMapped, ...filtered]);
      }
    })();
  }, []);

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
    const alreadyPending  = pendingRegs.includes(live.reg);
    return (
      <ProjectDetail
        item={live}
        alreadyAssigned={alreadyAssigned}
        alreadyPending={alreadyPending}
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
        onCancel={(item) => { cancelAssign(item.reg); setDetailItem(null); onNudge(); }}
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

  const cancelAssign = async (reg) => {
    setPendingRegs(prev => prev.filter(r => r !== reg));
    if (currentUserId) {
      try { await deleteAssignment(currentUserId, reg); } catch(_) {}
    }
    onNudge();
  };

  const handleSubmitCreate = async () => {
    if (!createTitle.trim() || !createDept || createSkills.length === 0) {
      setCreateError("\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u540d\u30fb\u6240\u5c5e\u5c40\u30fb\u5fc5\u8981\u30b9\u30ad\u30eb\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    const newReg = "REG-" + Date.now().toString(36).toUpperCase().slice(-6);
    const newItem = {
      reg: newReg,
      title: createTitle.trim(),
      dept: createDept,
      lead: currentCitizenName,
      leadId: currentCitizenId,
      skills: createSkills,
      status: "\u53d7\u4ed8\u4e2d",
      seats: createSeats,
      desc: createDesc.trim(),
    };
    try {
      if (currentUserId) {
        await createProject({
          reg: newReg,
          title: newItem.title,
          desc: newItem.desc,
          skills: newItem.skills,
          seats: newItem.seats,
          dept: newItem.dept,
          lead: newItem.lead,
          leadId: newItem.leadId,
          leadUserId: currentUserId,
        });
      }
      setBoardItems(prev => [newItem, ...prev]);
      setAssignedRegs(prev => [...prev, newReg]);
      setShowCreate(false);
      setCreateTitle(""); setCreateDesc(""); setCreateSkills([]); setCreateSeats(3); setCreateDept(""); setCreateError("");
      onNudge();
    } catch(e) {
      setCreateError("\u4fdd\u5b58\u306b\u5931\u6557\u3057\u307e\u3057\u305f: " + e.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const runAssign = () => {
    setAssignPhase("running");
    runSequence(ASSIGN_LOGS, setAssignLogs, async () => {
      setPendingRegs(prev => prev.includes(assignTarget.reg) ? prev : [...prev, assignTarget.reg]);
      // Supabaseへ申請を保存
      if (currentUserId) {
        try { await insertAssignment(currentUserId, assignTarget.reg); } catch(_) {}
      }
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
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{background:"rgba(255,153,0,0.15)",color:"#ff9900",fontSize:7.5,padding:"2px 8px",borderRadius:3,fontWeight:700}}>
                        {isLeadOf(p.reg) ? "承認待ち（起案者）" : "承認待ち"}
                      </span>
                      {!isLeadOf(p.reg) && (
                        <button onClick={() => cancelAssign(p.reg)}
                          style={{padding:"3px 9px",background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.35)",borderRadius:4,color:"#ef4444",fontSize:7.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.05em"}}>
                          申請を取り消す
                        </button>
                      )}
                    </div>
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

          {currentUserId && (
            <button onClick={() => setShowCreate(true)}
              style={{width:"100%",padding:"11px 0",marginBottom:16,background:"rgba(0,255,136,0.07)",border:"1px solid rgba(0,255,136,0.3)",borderRadius:8,color:C.green,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"background 0.15s"}}>
              <span style={{fontSize:13}}>+</span>プロジェクトを作成する
            </button>
          )}

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
                    {pendingRegs.includes(item.reg) && !assigned && <span style={{background:"rgba(245,158,11,0.15)",color:"#f59e0b",fontSize:8,padding:"2px 7px",borderRadius:3,letterSpacing:"0.1em",fontWeight:600}}>申請中</span>}
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

      {/* プロジェクト作成モーダル */}
      {showCreate && (
        <Modal onClose={() => { if (!createLoading) { setShowCreate(false); setCreateError(""); } }}>
          <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:3}}>プロジェクト登録</div>
              <div style={{fontSize:13,fontWeight:700,color:C.tx}}>新規プロジェクトを作成</div>
            </div>
            {!createLoading && (
              <button onClick={() => { setShowCreate(false); setCreateError(""); }}
                style={{background:"transparent",border:"none",color:C.txL,fontSize:18,cursor:"pointer",lineHeight:1,padding:0}}>✕</button>
            )}
          </div>

          {/* プロジェクト名 */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:5}}>プロジェクト名 <span style={{color:"#ef4444"}}>*</span></div>
            <input value={createTitle} onChange={e => setCreateTitle(e.target.value)}
              placeholder="プロジェクトのタイトルを入力"
              style={{width:"100%",padding:"9px 12px",background:C.bg,border:"1px solid "+C.border,borderRadius:6,color:C.tx,fontSize:12,fontFamily:"inherit",outline:"none",letterSpacing:"0.04em",boxSizing:"border-box"}}/>
          </div>

          {/* 説明 */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:5}}>概要・説明</div>
            <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)}
              placeholder="プロジェクトの内容や目的を記載してください" rows={3}
              style={{width:"100%",padding:"9px 12px",background:C.bg,border:"1px solid "+C.border,borderRadius:6,color:C.tx,fontSize:12,fontFamily:"inherit",outline:"none",resize:"none",letterSpacing:"0.04em",lineHeight:1.7,boxSizing:"border-box"}}/>
          </div>

          {/* 所属局 */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:5}}>所属局 <span style={{color:"#ef4444"}}>*</span></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["建設局","文化局","厘生局","情報局","行政局","財務局"].map(d => (
                <button key={d} onClick={() => setCreateDept(d)}
                  style={{padding:"5px 12px",background:createDept===d?C.navy:"transparent",border:"1px solid "+(createDept===d?C.navy:C.border),borderRadius:20,color:createDept===d?"#e4eaf4":C.txM,fontSize:9.5,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.06em"}}>{d}</button>
              ))}
            </div>
          </div>

          {/* 必要スキル */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:5}}>必要スキル（複数選択可） <span style={{color:"#ef4444"}}>*</span></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {DOMAINS.map(s => {
                const selected = createSkills.includes(s);
                return (
                  <button key={s} onClick={() => setCreateSkills(prev => selected ? prev.filter(x => x !== s) : [...prev, s])}
                    style={{padding:"5px 12px",background:selected?C.green:"transparent",border:"1px solid "+(selected?C.green:C.border),borderRadius:20,color:selected?"#000":C.txM,fontSize:9.5,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.06em",fontWeight:selected?700:400}}>{s}</button>
                );
              })}
            </div>
          </div>

          {/* 募集人数 */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:5}}>募集人数：<span style={{color:C.green,fontWeight:700}}>{createSeats}名</span></div>
            <input type="range" min={1} max={10} value={createSeats} onChange={e => setCreateSeats(Number(e.target.value))}
              style={{width:"100%",accentColor:"#00ff88"}}/>
          </div>

          {createError && (
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"8px 12px",marginBottom:12}}>
              <div style={{fontSize:9,color:"#ef4444"}}>{createError}</div>
            </div>
          )}

          <button onClick={handleSubmitCreate} disabled={createLoading}
            style={{width:"100%",padding:"12px",background:createLoading?"rgba(0,255,136,0.2)":C.green,border:"none",borderRadius:8,color:"#000",fontSize:11,fontWeight:700,cursor:createLoading?"default":"pointer",fontFamily:"inherit",letterSpacing:"0.1em",transition:"background 0.2s"}}>
            {createLoading ? "登録中…" : "プロジェクトを登録する"}
          </button>
          {!createLoading && (
            <button onClick={() => { setShowCreate(false); setCreateError(""); }}
              style={{width:"100%",marginTop:8,padding:"10px",background:"transparent",border:"1px solid "+C.border,borderRadius:8,color:C.txL,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
              キャンセル
            </button>
          )}
        </Modal>
      )}
    </>
  );
}
