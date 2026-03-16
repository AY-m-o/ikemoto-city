import { useState, useEffect } from "react";
import { C, LOGOUT_LOGS, runSequence } from "./constants.js";
import { SectionHead, LogTerminal, Btn, SubScreenNav } from "./components.jsx";
import { uploadAvatar, fetchAvatarUrl } from "./supabase.js";

// ─────────────────────────────────────────────
// SETTINGS VIEW（パラメータ設定）
// ─────────────────────────────────────────────
export function SettingsView({ onBack, onNudge, userId }) {
  const [displayName, setDisplayName] = useState("開発局員");
  const [notifs, setNotifs] = useState({ assign:true, market:false, system:true });
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (userId) fetchAvatarUrl(userId).then(url => { if (url) setAvatarUrl(url); });
  }, [userId]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setAvatarError("");
    setAvatarLoading(true);
    try {
      const url = await uploadAvatar(file, userId);
      setAvatarUrl(url);
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  const handleSave = () => {
    setSaved(true);
    onNudge();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}}>
      <SubScreenNav label="パラメータ設定" onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:12}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",fontWeight:600,marginBottom:12}}>プロフィール</div>

          {/* アバター */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <label style={{cursor:avatarLoading?"default":"pointer"}}>
              <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",background:"rgba(46,107,79,0.2)",border:"2px solid rgba(46,107,79,0.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <span style={{fontSize:22,color:C.green}}>&#9679;</span>}
              </div>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarUpload} disabled={avatarLoading}/>
            </label>
            <div>
              <div style={{fontSize:9,color:C.txL,letterSpacing:"0.08em",marginBottom:3}}>アイコン画像</div>
              <div style={{fontSize:8,color:"rgba(100,160,130,0.7)",letterSpacing:"0.04em"}}>{avatarLoading?"AI検査中…":"タップして変更（2MB以内）"}</div>
              {avatarError && <div style={{fontSize:8,color:"#ef4444",marginTop:3,lineHeight:1.4}}>{avatarError}</div>}
            </div>
          </div>

          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="表示名を入力"
            style={{width:"100%",padding:"8px 12px",background:C.bg,border:"1px solid "+C.border,borderRadius:7,color:C.tx,fontSize:12,fontFamily:"inherit",outline:"none",letterSpacing:"0.04em",boxSizing:"border-box"}}/>
        </div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:14}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",fontWeight:600,marginBottom:12}}>通知設定</div>
          {[
            { key:"assign", label:"参加申請の更新", sub:"承認・却下の通知" },
            { key:"market", label:"商業区の新着作品", sub:"推奨作品の通知" },
            { key:"system", label:"システム通達", sub:"行政からの重要通知" },
          ].map((n) => (
            <div key={n.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:C.tx,fontWeight:500,letterSpacing:"0.03em",marginBottom:2}}>{n.label}</div>
                <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.04em"}}>{n.sub}</div>
              </div>
              <div onClick={() => setNotifs((p) => ({...p,[n.key]:!p[n.key]}))}
                style={{width:36,height:20,borderRadius:10,background:notifs[n.key]?C.green:C.border,position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
                <div style={{position:"absolute",top:3,left:notifs[n.key]?18:3,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
              </div>
            </div>
          ))}
        </div>
        {saved && (
          <div style={{background:"rgba(46,107,79,0.08)",border:"1px solid "+C.green,borderRadius:7,padding:"10px 13px",marginBottom:12,animation:"fadeIn 0.2s ease"}}>
            <div style={{fontSize:9.5,color:C.green,fontWeight:600,letterSpacing:"0.08em"}}>設定を保存しました</div>
          </div>
        )}
        <Btn label="設定を保存する" onClick={handleSave}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INQUIRY VIEW（行政への意見具申）
// ─────────────────────────────────────────────
export function InquiryView({ onBack, onNudge }) {
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);

  const cats = ["行政サービスについて","作品登録・申請","掲示板・参加申請について","技術的な問題","その他"];

  if (done) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}}>
      <SubScreenNav label="行政への意見具申" onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{background:"rgba(46,107,79,0.08)",border:"1px solid "+C.green,borderRadius:8,padding:"18px 16px",marginBottom:14}}>
          <div style={{fontSize:12,color:C.green,fontWeight:700,letterSpacing:"0.06em",marginBottom:6}}>具申が受理されました</div>
          <div style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.04em"}}>ご意見は市政改善委員会に転送されました。<br/>回答まで最大5営業日お待ちください。</div>
        </div>
        <Btn label="マイページへ戻る" onClick={onBack} variant="ghost"/>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}} onScroll={onNudge}>
      <SubScreenNav label="行政への意見具申" onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:12}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",fontWeight:600,marginBottom:12}}>カテゴリ</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {cats.map((c) => (
              <button key={c} onClick={() => setCategory(c)} style={{padding:"5px 12px",background:category===c?C.navy:"transparent",border:"1px solid "+(category===c?C.navy:C.border),borderRadius:20,color:category===c?"#e4eaf4":C.txM,fontSize:9,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.04em"}}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:14}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",fontWeight:600,marginBottom:10}}>具申内容</div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="市政に対するご意見・ご要望をご記載ください。" rows={5} style={{width:"100%",padding:"10px 12px",background:C.bg,border:"1px solid "+C.border,borderRadius:6,color:C.tx,fontSize:12,fontFamily:"inherit",outline:"none",resize:"none",letterSpacing:"0.04em",lineHeight:1.8,boxSizing:"border-box"}}/>
          <div style={{textAlign:"right",marginTop:4}}>
            <span style={{fontSize:8.5,color:body.length>0?C.txM:C.txL}}>{body.length} 文字</span>
          </div>
        </div>
        <Btn label="具申を送信する" onClick={() => { if(category&&body){ setDone(true); onNudge(); } }} disabled={!category||!body}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGOUT VIEW（ログアウト）
// ─────────────────────────────────────────────
export function LogoutView({ onBack, onLogout, onNudge }) {
  const [phase, setPhase] = useState("confirm");
  const [logs, setLogs] = useState([]);

  const handleLogout = () => {
    setPhase("running");
    runSequence(LOGOUT_LOGS, setLogs, () => onLogout());
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}}>
      {phase === "confirm" && <SubScreenNav label="ログアウト" onBack={onBack}/>}
      <div style={{padding:"16px 14px 0"}}>
        <SectionHead accent={C.red} label="ログアウト" sub="端末接続の切断"/>
        {phase === "confirm" && (
          <>
            <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.red,borderRadius:7,padding:"13px 14px",marginBottom:16}}>
              <div style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.04em"}}>
                ログアウトすると、現在の端末との接続が切断されます。<br/>
                <span style={{color:C.txL}}>進行中の同期セッションは終了し、活動ログが市サーバーに保存されます。</span>
              </div>
            </div>
            <Btn label="ログアウトを実行する" onClick={handleLogout} variant="danger"/>
            <div style={{height:8}}/>
            <Btn label="キャンセル" onClick={onBack} variant="ghost"/>
          </>
        )}
        {phase === "running" && <LogTerminal logs={logs} running={true} dark={true}/>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GUIDE VIEW（市民ガイドブック）
// ─────────────────────────────────────────────
const GUIDE_TABS = [
  { icon:"⊞", name:"掲示板", desc:"共創プロジェクトへの参加申請ができます。各プロジェクトをタップすると詳細・概要・必要スキルを確認できます。「参加申請する」ボタンでプロジェクトに参加し、プロジェクトルームでメンバーとチャットできます。メッセージタブから参加中のプロジェクトルームに直接アクセスできます。" },
  { icon:"▫", name:"商業区", desc:"市内店舗の作品（制作物・製品・ライセンス）を閲覧・購入できます。店舗一覧から店舗を選ぶと商品一覧が表示され、商品をタップすると詳細（スペック・CA指数・価格）を確認できます。「物質化申請」ボタンで購入手続きができます。" },
  { icon:"▣", name:"行政", desc:"池本市の行政情報を閲覧できます。市政概要・市長室からのメッセージ・財政報告・市議会報告書・広報局のお知らせを確認できます。" },
  { icon:"⊕", name:"手続き", desc:"市民としての各種申請手続きを行います。作品出力許可申請・表現者認可申請などが利用できます。申請後は処理ログがリアルタイムで表示されます。" },
  { icon:"◉", name:"マイページ", desc:"市民証・EVI（存在価値係数）グラフ・参加中プロジェクト・設定などを確認できます。サポートページからガイドブックとFAQにアクセスできます。" },
];

export function GuideView({ onBack }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}}>
      <SubScreenNav label="市民ガイドブック" onBack={onBack}/>
      <div style={{padding:"14px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"10px 13px",marginBottom:14}}>
          <div style={{fontSize:9.5,color:C.txM,lineHeight:1.75,letterSpacing:"0.04em"}}>各タブの機能をタップで確認できます。</div>
        </div>
        {GUIDE_TABS.map((t,i) => (
          <div key={t.name}>
            <div onClick={() => setOpen(open===i?null:i)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:open===i?"7px 7px 0 0":7,padding:"12px 14px",marginBottom:open===i?0:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:7,background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"rgba(143,168,200,0.6)",flexShrink:0}}>{t.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,letterSpacing:"0.04em"}}>{t.name}</div>
              </div>
              <span style={{color:C.txL,fontSize:12,transition:"transform 0.2s",display:"inline-block",transform:open===i?"rotate(90deg)":"rotate(0deg)"}}>›</span>
            </div>
            {open===i && (
              <div style={{background:C.bg,border:"1px solid "+C.border,borderTop:"none",borderRadius:"0 0 7px 7px",padding:"12px 14px",marginBottom:8}}>
                <div style={{fontSize:9.5,color:C.txM,lineHeight:1.85,letterSpacing:"0.04em"}}>{t.desc}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FAQ VIEW
// ─────────────────────────────────────────────
const FAQ_ITEMS = [
  { q:"市民IDとは何ですか？", a:"池本市に登録された市民を識別する固有のIDです。IK-YYYY-XXXX の形式で発行されます。ログイン時に使用します。" },
  { q:"作品を購入するにはどうすればよいですか？", a:"商業区タブから店舗を選び、商品詳細ページの「物質化申請」ボタンから購入手続きができます。インフラ維持税（1.5%）が加算されます。" },
  { q:"プロジェクトに参加するには？", a:"掲示板タブからプロジェクトを選び、詳細ページの「参加申請する」ボタンから申請できます。担当スキルを選択してください。起案者の承認後、プロジェクトルームに参加できます。" },
  { q:"EVI（存在価値係数）とは？", a:"市民の活動量・貢献度を数値化したスコアです。プロジェクト参加・作品登録・手続き完了などの行動によって変動します。" },
  { q:"表現者認可申請は何が必要ですか？", a:"手続きタブの「表現者認可申請」から申請できます。本名・生年月日・住所・口座番号・身分証のアップロードが必要です。" },
  { q:"お問い合わせはどこからできますか？", a:"マイページ → 法的情報 → お問い合わせ からメールでご連絡いただけます。メールアドレスは info@city-ikemoto.jp です。" },
];

export function FaqView({ onBack }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}}>
      <SubScreenNav label="よくある質問" onBack={onBack}/>
      <div style={{padding:"14px 14px 0"}}>
        {FAQ_ITEMS.map((f,i) => (
          <div key={i}>
            <div onClick={() => setOpen(open===i?null:i)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:open===i?"7px 7px 0 0":7,padding:"12px 14px",marginBottom:open===i?0:8,cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{fontSize:10,color:C.green,fontWeight:700,flexShrink:0,marginTop:1}}>Q</span>
              <div style={{flex:1,fontSize:10,color:C.tx,fontWeight:600,letterSpacing:"0.03em",lineHeight:1.4}}>{f.q}</div>
              <span style={{color:C.txL,fontSize:12,flexShrink:0,transition:"transform 0.2s",display:"inline-block",transform:open===i?"rotate(90deg)":"rotate(0deg)"}}>›</span>
            </div>
            {open===i && (
              <div style={{background:C.bg,border:"1px solid "+C.border,borderTop:"none",borderRadius:"0 0 7px 7px",padding:"12px 14px 12px 24px",marginBottom:8,display:"flex",gap:10}}>
                <span style={{fontSize:10,color:C.txL,fontWeight:700,flexShrink:0,marginTop:1}}>A</span>
                <div style={{fontSize:9.5,color:C.txM,lineHeight:1.85,letterSpacing:"0.04em"}}>{f.a}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LEGAL VIEW
// ─────────────────────────────────────────────
const PRIVACY_TEXT = `プライバシーポリシー（施行日：2026年4月1日）

第1条（事業者）
池本市デジタル市役所を運営する事業者は本プライバシーポリシーに従い市民の個人情報を適切に管理します。

第2条（取得する情報）
登録時：メールアドレス、市民名（創作名可）、活動領域。
クリエイター登録時：本名、生年月日、住所、口座情報。
利用時：アクセスログ、端末情報、購買履歴。

第3条（利用目的）
本サービスの提供・改善。決済処理（Stripe）。不正利用の防止。法令に基づく対応。

第4条（第三者提供）
法令に基づく場合および決済処理のためStripeに提供する場合を除き第三者に個人情報を提供しません。

第5条（安全管理）
個人情報への不正アクセス・漏洩を防ぐため適切な安全管理措置を講じます。

第6条（お問い合わせ）
info@city-ikemoto.jp
運営者情報は請求があり次第開示します。`;

const TERMS_TEXT = `利用規約（施行日：2026年4月1日）

第1条（適用）
本規約は池本市デジタル市役所の利用に関する条件を定めます。

第2条（登録）
正確な情報での登録が必要です。1人1アカウントとします。18歳未満の方は利用できません。

第3条（禁止事項）
虚偽情報の登録。他の市民への誹謗中傷。アプリ外での金銭の授受。著作権を侵害するコンテンツの出品。その他法令に違反する行為。

第4条（作品の出品）
出品者は著作権を保有するコンテンツのみ出品できます。売上からインフラ維持税（1.5%）が徴収されます。決済はStripeを通じて処理されます。

第5条（免責事項）
市民間のトラブルについて運営は責任を負いません。システム障害による損害について運営は責任を負いません。

第6条（退会）
マイページの設定から退会できます。退会後のデータは削除されます。

第7条（規約の変更）
本規約は予告なく変更する場合があります。

お問い合わせ：info@city-ikemoto.jp`;

const COMMERCE_TEXT = `特定商取引法に基づく表記

販売業者：池本市デジタル市役所
運営責任者：請求があり次第開示します
所在地：請求があり次第開示します
メール：info@city-ikemoto.jp

販売価格：
各作品ページに表示の価格（インフラ維持税1.5%が加算されます）

支払方法：
クレジットカード（Stripe）

支払時期：
注文時に決済

商品引渡し時期：
デジタル商品は即時、物理商品は3営業日以内

返品・キャンセル：
デジタル商品は購入後の返品不可。物理商品は未発送の場合のみキャンセル可。`;

export function LegalView({ onBack, title, content }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}}>
      <SubScreenNav label={title} onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"16px 14px"}}>
          <pre style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.03em",whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{content}</pre>
        </div>
      </div>
    </div>
  );
}

export function ContactView({ onBack }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}}>
      <SubScreenNav label="お問い合わせ" onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"18px 16px",marginBottom:12}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.12em",marginBottom:8}}>お問い合わせ先</div>
          <div style={{fontSize:14,fontWeight:700,color:"#00ff88",letterSpacing:"0.04em",marginBottom:6}}>info@city-ikemoto.jp</div>
          <div style={{fontSize:9,color:C.txM,lineHeight:1.7}}>受付時間：平日 09:00–18:00（市民アクセス時間）</div>
        </div>
        <div style={{background:"rgba(0,255,136,0.04)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:7,padding:"12px 14px"}}>
          <div style={{fontSize:9,color:C.txM,lineHeight:1.75}}>メールに市民IDとお問い合わせ内容を記載の上ご連絡ください。返信は最大5営業日以内に対応いたします。</div>
        </div>
      </div>
    </div>
  );
}

// テキスト定数のエクスポート（MyPage.jsxでも使う場合に備え）
export { PRIVACY_TEXT, TERMS_TEXT, COMMERCE_TEXT };
