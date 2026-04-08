import { useState } from "react";
import { DIAGNOSIS_LOGS, ASSET_LOGS, runSequence } from "./constants.js";
import { Stamp, SectionHead, LogTerminal, Btn } from "./components.jsx";
import { useI18n } from "./i18n.js";
import { useTheme } from "./ThemeContext.jsx";

export default function ProcScreen({ onNudge, lang }) {
  const C = useTheme();
  const t = useI18n(lang);
  const [sub, setSub]     = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [logs, setLogs]   = useState([]);

  const [assetStep, setAssetStep] = useState(1);
  const [assetForm, setAssetForm] = useState({
    name: "", category: "服飾", price: "", type: "physical", concept: "", photos: []
  });

  // Stripe Connect登録フロー
  const [connectEmail, setConnectEmail]     = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError]     = useState("");
  const [connectDone, setConnectDone]       = useState(false);

  // URLクエリでConnect完了検知
  const params = new URLSearchParams(window.location.search);
  const connectSuccess = params.get("connect") === "success";

  const handleConnectRegister = async () => {
    setConnectError("");
    if (!connectEmail.trim()) { setConnectError("メールアドレスを入力してください。"); return; }
    setConnectLoading(true);
    try {
      const res = await fetch("/api/create-connect-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: connectEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connect error");
      window.location.href = data.url;
    } catch (err) {
      setConnectError(err.message);
      setConnectLoading(false);
    }
  };

  const run = (seq) => {
    setPhase("running");
    setLogs([]);
    runSequence(seq, setLogs, () => setPhase("done"));
  };

  const reset = () => { 
    setPhase("idle"); 
    setLogs([]); 
    setSub(null); 
    setAssetStep(1);
    setAssetForm({ name: "", category: "服飾", price: "", type: "physical", concept: "", photos: [] });
  };

  const updateForm = (k, v) => setAssetForm(p => ({ ...p, [k]: v }));

  // 手続き一覧
  if (!sub) return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      <div style={{padding:"15px 14px 0"}}>
        <SectionHead accent={C.navy} label="手続き" sub="Procedure"/>

        {/* Stripe Connect損完了バナー */}
        {connectSuccess && (
          <div style={{background:"rgba(46,107,79,0.1)",border:"1px solid rgba(46,107,79,0.4)",borderRadius:8,padding:"13px 14px",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:C.green,marginBottom:4}}>✓ 売上受取設定が完了しました</div>
            <div style={{fontSize:9,color:C.txM,lineHeight:1.7}}>Stripe Connectの登録が完了しました。売上は登録の口座に直接振り込まれます。</div>
          </div>
        )}

        {[
          { id:"creator", label:"表現者認可申請",   sub:"クリエイター登録",     desc:"市の産業区分との整合性を診断し、表現者として公式に登録します。" },
          { id:"asset",   label:"作品出力許可申請",   sub:"作品の市資産登録",   desc:"登録した作品を市の資産台帳に登録・管理する手続きを行います。" },
          { id:"connect", label:"売上受取設定",         sub:"Stripe Connect登録",  desc:"作品の売上を受け取るために決済アカウントを登録します。購入者の支払いからインフラ維持税（1.5%）を差し引いた金額が直接振り込まれます。" },
        ].map((p) => (
          <div key={p.id} className="card" onClick={()=>setSub(p.id)} style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:10,position:"relative",overflow:"hidden",cursor:"pointer"}}>
            <Stamp/>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.12em",marginBottom:5}}>{p.sub}</div>
            <div style={{fontSize:13,fontWeight:700,color:C.tx,marginBottom:6,letterSpacing:"0.03em"}}>{p.label}</div>
            <div style={{fontSize:9.5,color:C.txM,lineHeight:1.7,letterSpacing:"0.03em"}}>{p.desc}</div>
            <div style={{marginTop:10,fontSize:9,color:C.green,fontWeight:600,letterSpacing:"0.1em"}}>申請を開始 →</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Stripe Connect登録フロー ──
  if (sub === "connect") return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      <div style={{padding:"15px 14px 0"}}>
        <button onClick={reset} style={{background:"transparent",border:"none",color:C.txL,fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",marginBottom:14}}>{"\u2190 手続き一覧へ"}</button>
        <SectionHead accent={C.navy} label="売上受取設定" sub="Stripe Connect"/>

        <div style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"12px 14px",marginBottom:16}}>
          <div style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.04em"}}>
            作品購入時の売上が登録の口座に直接振り込まれます。<br/>
            <span style={{color:C.txL}}>インフラ維持税（1.5%）を差し引いた受取金額がお支払いされます。</span>
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.18em",marginBottom:6}}>メールアドレス</div>
          <input
            type="email"
            value={connectEmail}
            onChange={e => { setConnectEmail(e.target.value); setConnectError(""); }}
            placeholder="you@example.com"
            style={{width:"100%",padding:"10px 12px",background:C.bg,border:"1px solid "+C.border,borderRadius:7,color:C.tx,fontSize:10,fontFamily:"inherit",letterSpacing:"0.04em",outline:"none",boxSizing:"border-box"}}
          />
        </div>

        {connectError && (
          <div style={{background:"rgba(184,50,40,0.1)",border:"1px solid rgba(184,50,40,0.35)",borderRadius:7,padding:"9px 13px",marginBottom:12}}>
            <div style={{fontSize:8.5,color:"#e57a74",lineHeight:1.6}}>{connectError}</div>
          </div>
        )}

        <Btn
          label={connectLoading ? "接続中…" : "Stripe Connect登録を開始"}
          onClick={handleConnectRegister}
          disabled={connectLoading}
        />
        <div style={{marginTop:14,fontSize:8,color:C.txL,letterSpacing:"0.05em",lineHeight:1.8,textAlign:"center"}}>
          Stripeの外部ページで決済情報を登録します。<br/>
          銀行口座・本人確認書類が必要になる場合があります。
        </div>
      </div>
    </div>
  );

  // ── 申請フロー ──
  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      <div style={{padding:"15px 14px 0"}}>
        <button onClick={reset} style={{background:"transparent",border:"none",color:C.txL,fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",marginBottom:14}}>{"← 手続き一覧へ"}</button>
        <SectionHead accent={C.navy} label={sub==="creator" ? "表現者認可申請" : "資産出力許可申請"}/>

        {phase === "idle" && sub === "creator" && (
          <div>
            <div style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"12px 13px",marginBottom:16}}>
              <div style={{fontSize:9.5,color:C.txM,lineHeight:1.75,letterSpacing:"0.04em"}}>
                適性診断シーケンスを実行します。診断結果は市民活動ログに記録されます。
              </div>
            </div>
            <Btn label="適性診断を開始する" onClick={()=>run(DIAGNOSIS_LOGS)}/>
          </div>
        )}

        {phase === "idle" && sub === "asset" && (
          <div>
            <div style={{display:"flex",gap:4,marginBottom:16}}>
              {[1,2,3,4].map(s => (
                <div key={s} style={{flex:1,height:3,background:assetStep>=s?C.green:C.border,borderRadius:2}}/>
              ))}
            </div>

            {assetStep === 1 && (
              <div>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,marginBottom:12}}>Step 1：基本情報</div>
                <Input label="商品名" value={assetForm.name} onChange={e=>updateForm("name", e.target.value)} placeholder="例：無縫製レイヤード・シェル" />
                <Select label="カテゴリ" value={assetForm.category} onChange={e=>updateForm("category", e.target.value)} options={["服飾","映像","造形","ライセンス"]} />
                <Input label="価格" type="number" value={assetForm.price} onChange={e=>updateForm("price", e.target.value)} placeholder="例：12800" />
                <Select label="種別" value={assetForm.type} onChange={e=>updateForm("type", e.target.value)} options={[{v:"physical",l:"物理"},{v:"digital",l:"デジタル"},{v:"license",l:"ライセンス"}]} />
                <div style={{marginTop:20}}>
                  <Btn label="次へ" onClick={()=>setAssetStep(2)} disabled={!assetForm.name || !assetForm.price}/>
                </div>
              </div>
            )}

            {assetStep === 2 && (
              <div>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,marginBottom:12}}>Step 2：写真アップロード</div>
                <div style={{fontSize:9,color:C.txM,marginBottom:8}}>最大5枚まで登録可能（現在{assetForm.photos.length}枚）</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                  {assetForm.photos.map((p,i) => (
                    <div key={i} style={{width:60,height:60,background:C.border,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.txM,position:"relative"}}>
                      写真{i+1}
                      <button onClick={()=>updateForm("photos", assetForm.photos.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:-4,right:-4,background:C.red,color:"#fff",border:"none",borderRadius:"50%",width:16,height:16,fontSize:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
                    </div>
                  ))}
                  {assetForm.photos.length < 5 && (
                    <div onClick={()=>updateForm("photos", [...assetForm.photos, "photo"])} style={{width:60,height:60,border:"1px dashed "+C.txL,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.txL,cursor:"pointer"}}>
                      +
                    </div>
                  )}
                </div>
                <div style={{display:"flex",gap:8,marginTop:20}}>
                  <div style={{flex:1}}><Btn label="戻る" onClick={()=>setAssetStep(1)} variant="ghost"/></div>
                  <div style={{flex:2}}><Btn label="次へ" onClick={()=>setAssetStep(3)}/></div>
                </div>
              </div>
            )}

            {assetStep === 3 && (
              <div>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,marginBottom:12}}>Step 3：コンセプト</div>
                <div style={{marginBottom:12}}>
                  <textarea value={assetForm.concept} onChange={e=>updateForm("concept", e.target.value)} placeholder="作品の背景や仕様を入力してください" style={{width:"100%",boxSizing:"border-box",padding:10,borderRadius:6,border:"1px solid "+C.border,background:C.bg,fontSize:9.5,fontFamily:"inherit",color:C.tx,resize:"vertical",minHeight:80}}/>
                </div>
                {assetForm.concept && (
                  <div style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:6,padding:10,marginBottom:16}}>
                    <div style={{fontSize:8,color:C.txL,marginBottom:4}}>プレビュー</div>
                    <div style={{fontSize:9.5,color:C.tx,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{assetForm.concept}</div>
                  </div>
                )}
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1}}><Btn label="戻る" onClick={()=>setAssetStep(2)} variant="ghost"/></div>
                  <div style={{flex:2}}><Btn label="次へ" onClick={()=>setAssetStep(4)} disabled={!assetForm.concept}/></div>
                </div>
              </div>
            )}

            {assetStep === 4 && (
              <div>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,marginBottom:12}}>Step 4：最終確認</div>
                <div style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"12px 13px",marginBottom:16}}>
                  <div style={{fontSize:9.5,color:C.txM,lineHeight:1.75,letterSpacing:"0.04em"}}>
                    資産台帳への登録処理を実行します。登録後の変更には別途申請が必要です。
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1}}><Btn label="戻る" onClick={()=>setAssetStep(3)} variant="ghost"/></div>
                  <div style={{flex:2}}><Btn label="登録処理を開始" onClick={()=>run(ASSET_LOGS)}/></div>
                </div>
              </div>
            )}
          </div>
        )}

        {(phase==="running" || phase==="done") && (
          <div style={{marginTop: 16}}>
            <LogTerminal logs={logs} running={phase==="running"} dark={false}/>
          </div>
        )}

        {phase === "done" && (
          <div style={{marginTop: 16}}>
            <div style={{background:"rgba(46,107,79,0.08)",border:"1px solid "+C.green,borderRadius:7,padding:"12px 13px",marginBottom:14}}>
              <div style={{fontSize:10,color:C.green,fontWeight:600,letterSpacing:"0.08em",marginBottom:3}}>処理が完了しました</div>
              <div style={{fontSize:9.5,color:C.txM,letterSpacing:"0.04em",lineHeight:1.7}}>
                {sub==="creator" ? "申請内容は正常に記録されました。承認通知は後日通達されます。" : "資産は市の台帳に正常に登録・記録されました。"}
              </div>
            </div>
            <Btn label="手続き一覧へ戻る" onClick={reset} variant="ghost"/>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({label, type="text", value, onChange, placeholder}) {
  const C = useTheme();
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:9,color:C.txM,marginBottom:4}}>{label}</div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"1px solid "+C.border,background:C.bg,fontSize:10,fontFamily:"inherit",color:C.tx}}/>
    </div>
  );
}

function Select({label, value, onChange, options}) {
  const C = useTheme();
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:9,color:C.txM,marginBottom:4}}>{label}</div>
      <select value={value} onChange={onChange} style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:6,border:"1px solid "+C.border,background:C.bg,fontSize:10,fontFamily:"inherit",color:C.tx,WebkitAppearance:"none"}}>
        {options.map((o,i) => {
          const val = typeof o === "string" ? o : o.v;
          const lbl = typeof o === "string" ? o : o.l;
          return <option key={i} value={val}>{lbl}</option>;
        })}
      </select>
    </div>
  );
}
