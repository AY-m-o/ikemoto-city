import { useState, useCallback } from "react";
import { C, DOMAINS, CHARTER, SYNC_LOGS, runSequence } from "./constants.js";
import { AuthField, Btn, LogTerminal } from "./components.jsx";
import { signUp, signIn } from "./supabase.js";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode]               = useState("top"); // top|login|reg1|reg2|reg3
  const [citizenName, setCitizenName] = useState("");
  const [domain, setDomain]           = useState("");
  const [agreedCharter, setAgreedCharter] = useState(false);

  // メール+パスワード認証フィールド
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading,   setLoading]  = useState(false);

  // ログ演出
  const [syncLogs, setSyncLogs] = useState([]);
  const [syncing,  setSyncing]  = useState(false);
  const [idLogs,   setIdLogs]   = useState([]);
  const [genRunning, setGenRunning] = useState(false);

  // ── ログイン ──────────────────────────────────
  const handleLogin = useCallback(async () => {
    setAuthError("");
    if (!email.trim()) { setAuthError("メールアドレスを入力してください。"); return; }
    if (password.length < 6) { setAuthError("パスワードは6文字以上必要です。"); return; }
    setLoading(true);
    setSyncing(true);
    setSyncLogs([]);
    try {
      const { user, citizenId } = await signIn(email, password);
      runSequence(SYNC_LOGS, setSyncLogs, () => onLogin(citizenId, user.id));
    } catch (err) {
      setSyncing(false);
      setLoading(false);
      setAuthError("ログインに失敗しました。メールアドレスまたはパスワードが正しくありません。");
    }
  }, [email, password, onLogin]);

  // ── 新規登録 Step3 ────────────────────────────
  const handleReg3 = useCallback(async () => {
    setAuthError("");
    if (!email.trim()) { setAuthError("メールアドレスを入力してください。"); setMode("reg3e"); return; }
    if (password.length < 6) { setAuthError("パスワードは6文字以上必要です。"); setMode("reg3e"); return; }
    setGenRunning(true);
    setIdLogs(["個体情報を解析中…"]);
    try {
      const { user, citizenId } = await signUp(email, password, citizenName, domain);
      const seq = [
        "個体情報を解析中…",
        "市民名「" + citizenName + "」を記録中...",
        "活動領域「" + domain + "」を登録中...",
        "市民IDを生成中…",
        "市民ID【 " + citizenId + " 】の発行が完了しました。",
        "池本市へようこそ。市民活動の継続をサポートします。",
      ];
      runSequence(seq, setIdLogs, () => {
        setGenRunning(false);
        onLogin(citizenId, user.id);
      });
    } catch (err) {
      setGenRunning(false);
      setIdLogs([]);
      setAuthError("登録に失敗しました。" + (err.message || ""));
      setMode("reg3e");
    }
  }, [email, password, citizenName, domain, onLogin]);

  return (
    <div style={{
      minHeight:"100vh",
      background:C.navy,
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      padding:"48px 28px",
      position:"relative",
      overflow:"hidden",
      boxSizing:"border-box",
    }}>
      {/* グリッド背景 */}
      <div style={{position:"absolute",inset:0,opacity:0.025,backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:320,position:"relative"}}>

        {/* ロゴ */}
        <div style={{textAlign:"center",marginBottom:mode==="top"?48:32}}>
          <div style={{color:"rgba(143,168,200,0.4)",fontSize:7.5,letterSpacing:"0.28em",marginBottom:10}}>IKEMOTO CITY DIGITAL GOVERNMENT</div>
          <div style={{color:"#e4eaf4",fontSize:26,fontWeight:700,letterSpacing:"0.16em",marginBottom:6}}>池本市</div>
          <div style={{color:C.greenL,fontSize:9.5,letterSpacing:"0.22em"}}>デジタル市役所</div>
          <div style={{width:32,height:1,background:"rgba(46,107,79,0.4)",margin:"14px auto 0"}}/>
        </div>

        {/* ── TOP ── */}
        {mode==="top" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(46,107,79,0.3)",borderRadius:9,padding:"16px 15px",marginBottom:10}}>
              <div style={{color:"rgba(143,168,200,0.7)",fontSize:8,letterSpacing:"0.2em",marginBottom:10}}>ABOUT IKEMOTO CITY</div>
              <div style={{fontSize:9.5,color:"rgba(200,220,240,0.75)",lineHeight:1.85,letterSpacing:"0.04em",marginBottom:12}}>
                池本市は、仮想空間と現実空間を創造で結ぶ実験都市です。市民として登録し、プロジェクトに参加・アセットを制作・購入することで都市の成長に貢献できます。
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {[
                  { icon:"⊞", label:"掲示板",    desc:"共創プロジェクトへのアサイン申請" },
                  { icon:"◫", label:"商業区",    desc:"アセットの閲覧・物質化申請（購入）" },
                  { icon:"▣", label:"行政",      desc:"市政・財政・広報情報の閲覧" },
                  { icon:"⊕", label:"手続き",    desc:"表現者認可・アセット出力許可申請" },
                  { icon:"◉", label:"マイページ", desc:"市民証・EVI・参加プロジェクトの確認" },
                ].map(f => (
                  <div key={f.label} style={{display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:12,color:"rgba(143,168,200,0.4)",width:18,flexShrink:0,textAlign:"center"}}>{f.icon}</span>
                    <span style={{fontSize:8.5,color:"rgba(143,168,200,0.7)",fontWeight:600,letterSpacing:"0.08em",width:50,flexShrink:0}}>{f.label}</span>
                    <span style={{fontSize:8,color:"rgba(143,168,200,0.45)",letterSpacing:"0.04em",lineHeight:1.4}}>{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <Btn label="ログイン" onClick={()=>setMode("login")} variant="primary"/>
            <Btn label="居住申請（新規登録）" onClick={()=>setMode("reg1")} variant="ghost"/>
            <div style={{textAlign:"center",marginTop:16,color:"rgba(143,168,200,0.25)",fontSize:7.5,letterSpacing:"0.12em",lineHeight:1.8}}>
              本端末へのアクセスおよび操作履歴は記録・保管されます。<br/>池本市条例第7条
            </div>
          </div>
        )}

        {/* ── LOGIN ── */}
        {(mode==="login" || syncing) && (
          <div>
            {!syncing && (
              <>
                <AuthField label="メールアドレス" value={email} onChangeVal={v=>{setEmail(v);setAuthError("");}} placeholder="you@example.com" type="email"/>
                <AuthField label="パスワード" value={password} onChangeVal={v=>{setPassword(v);setAuthError("");}} placeholder="6文字以上" type="password"/>
                {authError && (
                  <div style={{background:"rgba(184,50,40,0.12)",border:"1px solid rgba(184,50,40,0.4)",borderRadius:6,padding:"9px 12px",marginBottom:12}}>
                    <div style={{fontSize:8.5,color:"#e57a74",letterSpacing:"0.04em",lineHeight:1.7}}>{authError}</div>
                  </div>
                )}
                <div style={{marginBottom:14}}/>
                <Btn label={loading?"認証中…":"認証"} onClick={handleLogin} disabled={loading}/>
                <button onClick={()=>{setMode("top");setAuthError("");}} style={{width:"100%",marginTop:8,background:"transparent",border:"none",color:"rgba(143,168,200,0.4)",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em"}}>← 戻る</button>
              </>
            )}
            {syncing && <LogTerminal logs={syncLogs} running={true}/>}
          </div>
        )}

        {/* ── REG STEP 1 ── */}
        {mode==="reg1" && (
          <div>
            <div style={{color:"rgba(143,168,200,0.5)",fontSize:8,letterSpacing:"0.2em",marginBottom:16,textAlign:"center"}}>居住申請 — STEP 1 / 4　個体情報の入力</div>
            <AuthField label="市民名（創作名可）" value={citizenName} onChangeVal={setCitizenName} placeholder="Kento"/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.18em",marginBottom:6}}>主要活動領域</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {DOMAINS.map(d=>(
                  <button key={d} onClick={()=>setDomain(d)} style={{padding:"5px 11px",background:domain===d?C.green:"rgba(255,255,255,0.06)",border:"1px solid "+(domain===d?C.green:"rgba(255,255,255,0.12)"),borderRadius:20,color:domain===d?"#fff":"rgba(200,220,240,0.7)",fontSize:9,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.06em"}}>{d}</button>
                ))}
              </div>
            </div>
            <div style={{marginTop:20}}/>
            <Btn label="次へ — 市民憲章への署名" onClick={()=>{ if(citizenName&&domain) setMode("reg2"); }} disabled={!citizenName||!domain}/>
            <button onClick={()=>setMode("top")} style={{width:"100%",marginTop:8,background:"transparent",border:"none",color:"rgba(143,168,200,0.4)",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em"}}>← 戻る</button>
          </div>
        )}

        {/* ── REG STEP 2（市民憲章）── */}
        {mode==="reg2" && (
          <div>
            <div style={{color:"rgba(143,168,200,0.5)",fontSize:8,letterSpacing:"0.2em",marginBottom:14,textAlign:"center"}}>居住申請 — STEP 2 / 4　市民憲章への署名</div>
            <div style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(46,107,79,0.3)",borderRadius:7,padding:"14px 15px",marginBottom:14,maxHeight:180,overflowY:"auto",scrollbarWidth:"none"}}>
              <div style={{color:"rgba(143,168,200,0.6)",fontSize:7.5,letterSpacing:"0.22em",marginBottom:10}}>池本市　市民憲章</div>
              <pre style={{color:"rgba(200,220,240,0.75)",fontSize:9.5,lineHeight:2,whiteSpace:"pre-wrap",fontFamily:"inherit",letterSpacing:"0.04em"}}>{CHARTER}</pre>
            </div>
            <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",marginBottom:18}}>
              <div onClick={()=>setAgreedCharter(v=>!v)} style={{width:16,height:16,marginTop:1,background:agreedCharter?C.green:"transparent",border:"1.5px solid "+(agreedCharter?C.green:"rgba(255,255,255,0.25)"),borderRadius:3,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                {agreedCharter && <span style={{color:"#fff",fontSize:9,lineHeight:1}}>✓</span>}
              </div>
              <span style={{color:"rgba(200,220,240,0.65)",fontSize:9.5,lineHeight:1.6,letterSpacing:"0.04em"}}>上記の市民憲章を読み、全条項に同意します。</span>
            </label>
            <Btn label="署名して次へ — メール登録" onClick={()=>{ if(agreedCharter) setMode("reg3e"); }} disabled={!agreedCharter}/>
            <button onClick={()=>setMode("reg1")} style={{width:"100%",marginTop:8,background:"transparent",border:"none",color:"rgba(143,168,200,0.4)",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em"}}>← 戻る</button>
          </div>
        )}

        {/* ── REG STEP 3e（メール+パスワード入力）── */}
        {(mode==="reg3e") && (
          <div>
            <div style={{color:"rgba(143,168,200,0.5)",fontSize:8,letterSpacing:"0.2em",marginBottom:14,textAlign:"center"}}>居住申請 — STEP 3 / 4　アカウント設定</div>
            <AuthField label="メールアドレス" value={email} onChangeVal={v=>{setEmail(v);setAuthError("");}} placeholder="you@example.com" type="email"/>
            <AuthField label="パスワード（6文字以上）" value={password} onChangeVal={v=>{setPassword(v);setAuthError("");}} placeholder="••••••••" type="password"/>
            {authError && (
              <div style={{background:"rgba(184,50,40,0.12)",border:"1px solid rgba(184,50,40,0.4)",borderRadius:6,padding:"9px 12px",marginBottom:12}}>
                <div style={{fontSize:8.5,color:"#e57a74",letterSpacing:"0.04em",lineHeight:1.7}}>{authError}</div>
              </div>
            )}
            <div style={{marginTop:20}}/>
            <Btn label="次へ — 市民ID生成" onClick={()=>{ if(email&&password.length>=6) setMode("reg3"); }} disabled={!email||password.length<6}/>
            <button onClick={()=>setMode("reg2")} style={{width:"100%",marginTop:8,background:"transparent",border:"none",color:"rgba(143,168,200,0.4)",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em"}}>← 戻る</button>
          </div>
        )}

        {/* ── REG STEP 4（市民ID生成）── */}
        {mode==="reg3" && (
          <div>
            <div style={{color:"rgba(143,168,200,0.5)",fontSize:8,letterSpacing:"0.2em",marginBottom:14,textAlign:"center"}}>居住申請 — STEP 4 / 4　市民ID生成シーケンス</div>
            {idLogs.length > 0 && <LogTerminal logs={idLogs} running={genRunning}/>}
            {authError && (
              <div style={{background:"rgba(184,50,40,0.12)",border:"1px solid rgba(184,50,40,0.4)",borderRadius:6,padding:"9px 12px",marginBottom:12,marginTop:8}}>
                <div style={{fontSize:8.5,color:"#e57a74",letterSpacing:"0.04em",lineHeight:1.7}}>{authError}</div>
              </div>
            )}
            {idLogs.length === 0 && !authError && (
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{color:"rgba(200,220,240,0.6)",fontSize:9.5,letterSpacing:"0.08em",lineHeight:1.8,marginBottom:24}}>
                  入力情報を確認しました。<br/>市民IDの生成を開始します。
                </div>
                <Btn label={genRunning?"生成中…":"市民ID生成を実行"} onClick={handleReg3} disabled={genRunning}/>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
