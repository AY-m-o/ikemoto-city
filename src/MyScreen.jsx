import { useState } from "react";
import { C, LOGOUT_LOGS, BOARD_ITEMS_INIT, runSequence } from "./constants.js";
import { SectionHead, LogTerminal, Btn, Field, SubScreenNav } from "./components.jsx";

// ─────────────────────────────────────────────
// SETTINGS SUB-VIEW
// ─────────────────────────────────────────────
function SettingsView({ onBack, onNudge }) {
  const [displayName, setDisplayName] = useState("開発局員");
  const [notifs, setNotifs] = useState({ assign:true, market:false, system:true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onNudge();
    setTimeout(()=>setSaved(false), 2500);
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
      <SubScreenNav label="パラメータ設定" onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:12}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",fontWeight:600,marginBottom:12}}>プロフィール</div>
          <Field label="表示名" value={displayName} onChangeVal={setDisplayName} placeholder="表示名を入力"/>
        </div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:14}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",fontWeight:600,marginBottom:12}}>通知設定</div>
          {[
            { key:"assign", label:"アサイン申請の更新", sub:"承認・却下の通知" },
            { key:"market", label:"商業区の新着アセット", sub:"推奨アセットの通知" },
            { key:"system", label:"システム通達", sub:"行政からの重要通知" },
          ].map((n) => (
            <div key={n.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:C.tx,fontWeight:500,letterSpacing:"0.03em",marginBottom:2}}>{n.label}</div>
                <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.04em"}}>{n.sub}</div>
              </div>
              <div onClick={()=>setNotifs((p)=>({...p,[n.key]:!p[n.key]}))}
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
// INQUIRY SUB-VIEW
// ─────────────────────────────────────────────
function InquiryView({ onBack, onNudge }) {
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);

  const cats = ["行政サービスについて","アセット登録・申請","掲示板・アサインについて","技術的な問題","その他"];

  if (done) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
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
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      <SubScreenNav label="行政への意見具申" onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:12}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",fontWeight:600,marginBottom:12}}>カテゴリ</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {cats.map((c) => (
              <button key={c} onClick={()=>setCategory(c)} style={{padding:"5px 12px",background:category===c?C.navy:"transparent",border:"1px solid "+(category===c?C.navy:C.border),borderRadius:20,color:category===c?"#e4eaf4":C.txM,fontSize:9,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.04em"}}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px",marginBottom:14}}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",fontWeight:600,marginBottom:10}}>具申内容</div>
          <textarea value={body} onChange={(e)=>setBody(e.target.value)} placeholder="市政に対するご意見・ご要望をご記載ください。" rows={5} style={{width:"100%",padding:"10px 12px",background:C.bg,border:"1px solid "+C.border,borderRadius:6,color:C.tx,fontSize:12,fontFamily:"inherit",outline:"none",resize:"none",letterSpacing:"0.04em",lineHeight:1.8,boxSizing:"border-box"}}/>
          <div style={{textAlign:"right",marginTop:4}}>
            <span style={{fontSize:8.5,color:body.length>0?C.txM:C.txL}}>{body.length} 文字</span>
          </div>
        </div>
        <Btn label="具申を送信する" onClick={()=>{ if(category&&body){ setDone(true); onNudge(); } }} disabled={!category||!body}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGOUT SUB-VIEW
// ─────────────────────────────────────────────
function LogoutView({ onBack, onLogout, onNudge }) {
  const [phase, setPhase] = useState("confirm");
  const [logs, setLogs] = useState([]);

  const handleLogout = () => {
    setPhase("running");
    runSequence(LOGOUT_LOGS, setLogs, () => onLogout());
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
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
// LEGAL / CONTACT SUB-VIEWS
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

第4条（アセットの出品）
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
各アセットページに表示の価格（インフラ維持税1.5%が加算されます）

支払方法：
クレジットカード（Stripe）

支払時期：
注文時に決済

商品引渡し時期：
デジタル商品は即時、物理商品は3営業日以内

返品・キャンセル：
デジタル商品は購入後の返品不可。物理商品は未発送の場合のみキャンセル可。`;

const GUIDE_TABS = [
  { icon:"⊞", name:"掲示板", desc:"共創プロジェクトへの参加申請ができます。各プロジェクトをタップすると詳細・概要・必要スキルを確認できます。「アサインを申請する」ボタンでプロジェクトに参加し、プロジェクトルームでメンバーとチャットできます。メッセージタブから参加中のプロジェクトルームに直接アクセスできます。" },
  { icon:"◫", name:"商業区", desc:"市内店舗のアセット（作品・製品・ライセンス）を閲覧・購入できます。店舗一覧から店舗を選ぶと商品一覧が表示され、商品をタップすると詳細（スペック・CA指数・価格）を確認できます。「物質化申請」ボタンで購入手続きができます。" },
  { icon:"▣", name:"行政", desc:"池本市の行政情報を閲覧できます。市政概要・市長室からのメッセージ・財政報告・市議会報告書・広報局のお知らせを確認できます。" },
  { icon:"⊕", name:"手続き", desc:"市民としての各種申請手続きを行います。アセット出力許可申請・表現者認可申請などが利用できます。申請後は処理ログがリアルタイムで表示されます。" },
  { icon:"◉", name:"マイページ", desc:"市民証・EVI（存在価値係数）グラフ・参加中プロジェクト・設定などを確認できます。サポートページからガイドブックとFAQにアクセスできます。" },
];

const FAQ_ITEMS = [
  { q:"市民IDとは何ですか？", a:"池本市に登録された市民を識別する固有のIDです。IK-YYYY-XXXX の形式で発行されます。ログイン時に使用します。" },
  { q:"アセットを購入するにはどうすればよいですか？", a:"商業区タブから店舗を選び、商品詳細ページの「物質化申請」ボタンから購入手続きができます。インフラ維持税（1.5%）が加算されます。" },
  { q:"プロジェクトに参加するには？", a:"掲示板タブからプロジェクトを選び、詳細ページの「アサインを申請する」ボタンから申請できます。担当スキルを選択してください。起案者の承認後、プロジェクトルームに参加できます。" },
  { q:"EVI（存在価値係数）とは？", a:"市民の活動量・貢献度を数値化したスコアです。プロジェクト参加・アセット登録・手続き完了などの行動によって変動します。" },
  { q:"表現者認可申請は何が必要ですか？", a:"手続きタブの「表現者認可申請」から申請できます。本名・生年月日・住所・口座番号・身分証のアップロードが必要です。" },
  { q:"お問い合わせはどこからできますか？", a:"マイページ → 法的情報 → お問い合わせ からメールでご連絡いただけます。メールアドレスは info@city-ikemoto.jp です。" },
];

function GuideView({ onBack }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
      <SubScreenNav label="市民ガイドブック" onBack={onBack}/>
      <div style={{padding:"14px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"10px 13px",marginBottom:14}}>
          <div style={{fontSize:9.5,color:C.txM,lineHeight:1.75,letterSpacing:"0.04em"}}>各タブの機能をタップで確認できます。</div>
        </div>
        {GUIDE_TABS.map((t,i) => (
          <div key={t.name}>
            <div onClick={()=>setOpen(open===i?null:i)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:open===i?"7px 7px 0 0":7,padding:"12px 14px",marginBottom:open===i?0:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
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

function FaqView({ onBack }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
      <SubScreenNav label="よくある質問" onBack={onBack}/>
      <div style={{padding:"14px 14px 0"}}>
        {FAQ_ITEMS.map((f,i) => (
          <div key={i}>
            <div onClick={()=>setOpen(open===i?null:i)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:open===i?"7px 7px 0 0":7,padding:"12px 14px",marginBottom:open===i?0:8,cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10}}>
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

function LegalView({ onBack, title, content }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
      <SubScreenNav label={title} onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"16px 14px"}}>
          <pre style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.03em",whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{content}</pre>
        </div>
      </div>
    </div>
  );
}

function ContactView({ onBack }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
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

// フォロー中店舗ページ
function FollowingView({ onBack, followedShops, onNavigateMarket }) {
  const shops = Object.keys(followedShops || {});
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
      <SubScreenNav label="フォロー中の店舗" onBack={onBack}/>
      <div style={{padding:"14px 14px 0"}}>
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:10}}>FOLLOWING — {shops.length}店舗</div>
        {shops.length === 0 ? (
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"22px 16px",textAlign:"center"}}>
            <div style={{fontSize:9.5,color:C.txL,marginBottom:5}}>フォロー中の店舗はありません</div>
            <div style={{fontSize:8.5,color:C.txL}}>商業区で店舗を開いてフォローしてみましょう</div>
          </div>
        ) : shops.map(shopName => (
          <div key={shopName}
            onClick={() => { onNavigateMarket && onNavigateMarket(shopName); }}
            style={{background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"13px 14px",marginBottom:9,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:7,background:"linear-gradient(135deg,rgba(0,255,136,0.15),rgba(0,100,60,0.3))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.green,border:"1px solid rgba(0,255,136,0.2)",flexShrink:0}}>&#9647;</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.tx,letterSpacing:"0.04em"}}>{shopName}</div>
                <div style={{fontSize:8,color:C.txL,marginTop:3}}>商業区登録店舗</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{background:"rgba(0,255,136,0.1)",color:C.green,fontSize:7.5,padding:"2px 7px",borderRadius:3,fontWeight:600}}>フォロー中</span>
              <span style={{color:C.txL,fontSize:14}}>&#x203A;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// いいね済みページ（アセット + 店舗）
function LikedView({ onBack, likedItems, likedShops, onNavigateMarket }) {
  const entries = Object.entries(likedItems || {});
  const shopEntries = Object.keys(likedShops || {});
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
      <SubScreenNav label="いいね済み" onBack={onBack}/>
      <div style={{padding:"14px 14px 0"}}>
        {/* いいね済み店舗 */}
        {shopEntries.length > 0 && (
          <>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:10}}>♥ LIKED SHOPS — {shopEntries.length}店舗</div>
            {shopEntries.map(shopName => (
              <div key={shopName}
                onClick={() => { onNavigateMarket && onNavigateMarket(shopName); }}
                style={{background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid #ff6090",borderRadius:8,padding:"12px 14px",marginBottom:9,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:7,background:"rgba(255,60,100,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#ff6090",flexShrink:0}}>♥</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:C.tx,letterSpacing:"0.04em"}}>{shopName}</div>
                    <div style={{fontSize:8,color:C.txL,marginTop:2}}>店舗を見る →</div>
                  </div>
                </div>
                <span style={{color:C.txL,fontSize:14}}>&#x203A;</span>
              </div>
            ))}
            <div style={{height:6}}/>
          </>
        )}
        {/* いいね済みアセット */}
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:10}}>LIKED ASSETS — {entries.length}件</div>
        {entries.length === 0 && shopEntries.length === 0 ? (
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"22px 16px",textAlign:"center"}}>
            <div style={{fontSize:9.5,color:C.txL,marginBottom:5}}>いいねしたアイテムはありません</div>
            <div style={{fontSize:8.5,color:C.txL}}>商業区で店舗・アセットにいいねしてみましょう</div>
          </div>
        ) : entries.map(([name, data]) => (
          <div key={name}
            onClick={() => { onNavigateMarket && onNavigateMarket(data.shop, name); }}
            style={{background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"13px 14px",marginBottom:9,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:7,background:"rgba(0,255,136,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.green,flexShrink:0,border:"1px solid rgba(0,255,136,0.2)"}}>◈</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:C.tx,letterSpacing:"0.03em",lineHeight:1.3}}>{name}</div>
              <div style={{fontSize:8,color:C.txL,marginTop:3}}>{data.shop}</div>
            </div>
            <span style={{color:C.txL,fontSize:14}}>&#x203A;</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MY SCREEN (root)
// ─────────────────────────────────────────────
export default function MyScreen({ citizenId, onNudge, onLogout, followedShops, likedItems, likedShops, onNavigateMarket, blockedShops, onUnblockShop, lang }) {
  const [subView, setSubView] = useState(null);

  if (subView === "settings")  return <SettingsView  onBack={()=>setSubView(null)} onNudge={onNudge}/>;
  if (subView === "inquiry")   return <InquiryView   onBack={()=>setSubView(null)} onNudge={onNudge}/>;
  if (subView === "logout")    return <LogoutView    onBack={()=>setSubView(null)} onLogout={onLogout} onNudge={onNudge}/>;
  if (subView === "guide")     return <GuideView     onBack={()=>setSubView(null)}/>;
  if (subView === "faq")       return <FaqView       onBack={()=>setSubView(null)}/>;
  if (subView === "privacy")   return <LegalView onBack={()=>setSubView(null)} title="プライバシーポリシー" content={PRIVACY_TEXT}/>;
  if (subView === "terms")     return <LegalView onBack={()=>setSubView(null)} title="利用規約" content={TERMS_TEXT}/>;
  if (subView === "commerce")  return <LegalView onBack={()=>setSubView(null)} title="特定商取引法に基づく表記" content={COMMERCE_TEXT}/>;
  if (subView === "contact")   return <ContactView onBack={()=>setSubView(null)}/>;
  if (subView === "following") return <FollowingView onBack={()=>setSubView(null)} followedShops={followedShops} onNavigateMarket={onNavigateMarket}/>;
  if (subView === "liked")     return <LikedView     onBack={()=>setSubView(null)} likedItems={likedItems} likedShops={likedShops} onNavigateMarket={onNavigateMarket}/>;
  if (subView === "blocked")   return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72}}>
      <SubScreenNav label="ブロックリスト" onBack={()=>setSubView(null)}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.18em",marginBottom:12}}>ブロック中の店舗 // BLOCKED SHOPS</div>
        {Object.keys(blockedShops||{}).length===0 ? (
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:10,padding:"24px 16px",textAlign:"center"}}>
            <div style={{fontSize:11,color:C.txL,letterSpacing:"0.08em"}}>ブロック中の店舗はありません</div>
          </div>
        ) : (
          Object.keys(blockedShops||{}).map(shopName=>(
            <div key={shopName} style={{background:C.card,border:"1px solid "+C.border,borderRadius:10,padding:"13px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:10,fontWeight:600,color:C.tx,letterSpacing:"0.04em",marginBottom:3}}>{shopName}</div>
                <div style={{fontSize:8,color:C.txL,letterSpacing:"0.08em"}}>ブロック中</div>
              </div>
              <button onClick={()=>onUnblockShop&&onUnblockShop(shopName)}
                style={{background:"transparent",border:"1px solid rgba(0,255,136,0.2)",borderRadius:6,padding:"5px 12px",color:"rgba(0,255,136,0.6)",fontSize:8.5,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em"}}>
                解除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // EVIグラフデータ（折れ線）
  const eviData = [0.62,0.71,0.68,0.80,0.75,0.84,0.91];
  const labels  = ["月","火","水","木","金","土","日"];

  // 参加中プロジェクト（充足のもの）
  const joinedProjects = BOARD_ITEMS_INIT.filter(b => b.status === "充足");

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      <div style={{padding:"15px 14px 0"}}>
        {/* 市民証ミニカード */}
        <div style={{background:C.navy,borderRadius:9,padding:"14px 15px",marginBottom:14,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(46,107,79,0.1)"}}/>
          <div style={{color:"rgba(143,168,200,0.45)",fontSize:7.5,letterSpacing:"0.22em",marginBottom:6}}>CITIZEN</div>
          <div style={{color:"#dde8f5",fontSize:16,fontWeight:700,letterSpacing:"0.16em",marginBottom:3}}>{citizenId}</div>
          <div style={{color:"#3d8a65",fontSize:9.5,fontWeight:500}}>開発局員　<span style={{color:"#4caf7d",animation:"pulse 2.5s infinite"}}>●</span><span style={{color:"#4caf7d"}}> 稼働中</span></div>
        </div>

        {/* EVI 折れ線グラフ */}
        <SectionHead accent={C.navy} label="EVI — 存在価値係数" sub="Existence Value Index"/>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px 10px",marginBottom:12}}>
          {(()=>{
            const W=320, H=82, PX=24, PY=10;
            const cw = W - PX*2, ch = H - PY*2;
            const min = 0.5, max2 = 1.0;
            const xs = eviData.map((_,i) => PX + (i/(eviData.length-1))*cw);
            const ys = eviData.map(v => PY + ch - ((v-min)/(max2-min))*ch);
            const poly = xs.map((x,i) => x+","+ys[i]).join(" ");
            const fill = "M "+xs[0]+","+ys[0]+" " + xs.map((x,i)=>x+","+ys[i]).join(" L ") + " L "+xs[xs.length-1]+","+(PY+ch)+" L "+xs[0]+","+(PY+ch)+" Z";
            const gridVals = [0.6,0.7,0.8,0.9,1.0];
            return (
              <svg width={W} height={H} style={{display:"block",width:"100%",overflow:"visible"}}>
                {gridVals.map(gv=>{
                  const gy = PY + ch - ((gv-min)/(max2-min))*ch;
                  return <line key={gv} x1={PX} x2={W-PX} y1={gy} y2={gy} stroke={C.borderD} strokeWidth="1"/>;
                })}
                <defs>
                  <linearGradient id="eviGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity="0.35"/>
                    <stop offset="100%" stopColor={C.green} stopOpacity="0.02"/>
                  </linearGradient>
                </defs>
                <path d={fill} fill="url(#eviGrad)"/>
                <polyline points={poly} fill="none" stroke={C.green} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
                {xs.map((x,i)=>(
                  <g key={i}>
                    <circle cx={x} cy={ys[i]} r={i===eviData.length-1?4:2.5}
                      fill={i===eviData.length-1?"#4caf7d":C.card}
                      stroke={C.green} strokeWidth={i===eviData.length-1?0:1.5}/>
                    <text x={x} y={H-1} textAnchor="middle" fontSize="8" fill="rgba(90,100,120,0.6)">{labels[i]}</text>
                    {i===eviData.length-1 && (
                      <text x={x} y={ys[i]-8} textAnchor="middle" fontSize="8.5" fill="#4caf7d" fontWeight="700">{eviData[i]}</text>
                    )}
                  </g>
                ))}
              </svg>
            );
          })()}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <span style={{fontSize:8.5,color:C.txL,letterSpacing:"0.08em"}}>今週の推移</span>
            <span style={{fontSize:10,color:C.green,fontWeight:700,letterSpacing:"0.06em"}}>最新：{eviData[eviData.length-1]}</span>
          </div>
        </div>

        {/* 統計グリッド */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
          {[
            { label:"CA指数", val:"0.888", sub:"Compatibility Alignment" },
            { label:"アサイン数", val:"3", sub:"累計従事プロジェクト" },
            { label:"登録アセット", val:"2", sub:"封印済資産" },
            { label:"市民歴", val:"12日", sub:"市制施行からの経過" },
          ].map((s) => (
            <div key={s.label} style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"11px 12px"}}>
              <div style={{fontSize:8,color:C.txL,letterSpacing:"0.12em",marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:18,fontWeight:700,color:C.tx,letterSpacing:"0.06em",marginBottom:2}}>{s.val}</div>
              <div style={{fontSize:7.5,color:C.txL,letterSpacing:"0.06em"}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* 参加中プロジェクト */}
        <SectionHead accent={C.navy} label="参加中のプロジェクト" sub="Active Projects"/>
        {joinedProjects.length === 0 ? (
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:9.5,color:C.txL,letterSpacing:"0.08em"}}>まだ参加中のプロジェクトはありません</div>
            <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em",marginTop:5}}>掲示板からプロジェクトにアサインしてください</div>
          </div>
        ) : (
          joinedProjects.map(p => (
            <div key={p.reg}
              style={{background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"11px 13px",marginBottom:8,cursor:"default",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:8,color:C.txL,letterSpacing:"0.12em",marginBottom:3}}>{p.dept} / {p.reg}</div>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,letterSpacing:"0.03em",lineHeight:1.3}}>{p.title}</div>
                <div style={{fontSize:8,color:C.txM,marginTop:4}}>起案者：{p.lead}</div>
              </div>
              <span style={{background:"rgba(46,107,79,0.1)",color:C.green,fontSize:7.5,padding:"2px 8px",borderRadius:3,fontWeight:600,flexShrink:0,marginLeft:8}}>参加中</span>
            </div>
          ))
        )}

        {/* ソーシャル — フォロー中・いいね済みボタン */}
        <SectionHead accent={C.navy} label="ソーシャル活動" sub="Social"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
          <div onClick={() => setSubView("following")}
            style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
            <div style={{width:38,height:38,borderRadius:8,background:"linear-gradient(135deg,rgba(46,107,79,0.3),rgba(26,57,44,0.5))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:C.green,border:"1px solid rgba(46,107,79,0.3)"}}>◫</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.tx,marginBottom:2}}>フォロー中</div>
              <div style={{fontSize:8.5,color:C.txL}}>{Object.keys(followedShops||{}).length}店舗</div>
            </div>
            <span style={{fontSize:8,color:C.green,fontWeight:600}}>店舗一覧 ›</span>
          </div>
          <div onClick={() => setSubView("liked")}
            style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
            <div style={{width:38,height:38,borderRadius:8,background:"rgba(46,107,79,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.green,border:"1px solid rgba(46,107,79,0.25)"}}>◈</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.tx,marginBottom:2}}>いいね済み</div>
              <div style={{fontSize:8.5,color:C.txL}}>{Object.keys(likedItems||{}).length}件</div>
            </div>
            <span style={{fontSize:8,color:C.green,fontWeight:600}}>アセット一覧 ›</span>
          </div>
        </div>

        {/* 設定メニュー */}
        <SectionHead accent={C.navy} label="設定・問い合わせ"/>
        {[
          { key:"settings", label:"パラメータ設定",   sub:"プロフィール・通知設定" },
          { key:"blocked",  label:"ブロックリスト",    sub:"ブロック中の店舗を管理" },
          { key:"inquiry",  label:"行政への意見具申", sub:"問い合わせフォーム" },
          { key:"logout",   label:"ログアウト",       sub:"端末との接続を切断" },
        ].map((m) => (
          <div key={m.key} onClick={()=>setSubView(m.key)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:m.key==="logout"?C.red:C.tx,letterSpacing:"0.04em",marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em"}}>{m.sub}</div>
            </div>
            <span style={{color:C.txL,fontSize:14}}>›</span>
          </div>
        ))}

        {/* サポートセクション */}
        <SectionHead accent={C.navy} label="サポート" sub="Support"/>
        {[
          { key:"guide", label:"市民ガイドブック",   sub:"各タブの使い方・チュートリアル" },
          { key:"faq",   label:"よくある質問",       sub:"FAQ" },
        ].map((m) => (
          <div key={m.key} onClick={()=>setSubView(m.key)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:C.tx,letterSpacing:"0.04em",marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em"}}>{m.sub}</div>
            </div>
            <span style={{color:C.txL,fontSize:14}}>›</span>
          </div>
        ))}

        {/* 法的情報 */}
        <SectionHead accent={C.navy} label="法的情報" sub="Legal"/>
        {[
          { key:"privacy",  label:"プライバシーポリシー",         sub:"個人情報の取り扱いについて" },
          { key:"terms",    label:"利用規約",                    sub:"利用条件・禁止事項" },
          { key:"commerce", label:"特定商取引法に基づく表記",     sub:"事業者情報・返金ポリシー" },
          { key:"contact",  label:"お問い合わせ",                sub:"info@city-ikemoto.jp" },
        ].map((m) => (
          <div key={m.key} onClick={()=>setSubView(m.key)} style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:C.tx,letterSpacing:"0.04em",marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em"}}>{m.sub}</div>
            </div>
            <span style={{color:C.txL,fontSize:14}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
