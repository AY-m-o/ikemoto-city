import { useState, useEffect } from "react";
import { BOARD_ITEMS_INIT } from "./constants.js";
import { SectionHead, SubScreenNav } from "./components.jsx";
import { useI18n } from "./i18n.js";
import { SettingsView, InquiryView, LogoutView, GuideView, FaqView, LegalView, ContactView, PRIVACY_TEXT, TERMS_TEXT, COMMERCE_TEXT } from "./Settings.jsx";
import BlockList from "./BlockList.jsx";
import { supabase } from "./supabase.js";
import { useTheme } from "./ThemeContext.jsx";

// ─────────────────────────────────────────────
// FOLLOWING VIEW（フォロー中店舗一覧）
// ─────────────────────────────────────────────
function FollowingView({ onBack, followedShops, onNavigateMarket }) {
  const C = useTheme();
  const shops = Object.keys(followedShops || {});
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:C.bg,color:C.tx}}>
      <SubScreenNav label="フォロー中の店舗" onBack={onBack}/>
      <div style={{padding:"14px 14px 0"}}>
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:10}}>FOLLOWING — {shops.length}店舗</div>
        {shops.length === 0 ? (
          <div style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"22px 16px",textAlign:"center"}}>
            <div style={{fontSize:9.5,color:C.txL,marginBottom:5}}>フォロー中の店舗はありません</div>
            <div style={{fontSize:8.5,color:C.txL}}>商業区で店舗を開いてフォローしてみましょう</div>
          </div>
        ) : shops.map(shopName => (
          <div key={shopName}
            onClick={() => { onNavigateMarket && onNavigateMarket(shopName); }}
            style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"13px 14px",marginBottom:9,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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

// ─────────────────────────────────────────────
// LIKED VIEW（いいね済みアセット + 店舗）
// ─────────────────────────────────────────────
function LikedView({ onBack, likedItems, likedShops, onNavigateMarket }) {
  const C = useTheme();
  const entries = Object.entries(likedItems || {});
  const shopEntries = Object.keys(likedShops || {});
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:C.bg,color:C.tx}}>
      <SubScreenNav label="いいね済み" onBack={onBack}/>
      <div style={{padding:"14px 14px 0"}}>
        {shopEntries.length > 0 && (
          <>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:10}}>♥ LIKED SHOPS — {shopEntries.length}店舗</div>
            {shopEntries.map(shopName => (
              <div key={shopName}
                onClick={() => { onNavigateMarket && onNavigateMarket(shopName); }}
                style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid #ff6090",borderRadius:8,padding:"12px 14px",marginBottom:9,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:10}}>LIKED ASSETS — {entries.length}件</div>
        {entries.length === 0 && shopEntries.length === 0 ? (
          <div style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"22px 16px",textAlign:"center"}}>
            <div style={{fontSize:9.5,color:C.txL,marginBottom:5}}>いいねしたアイテムはありません</div>
            <div style={{fontSize:8.5,color:C.txL}}>商業区で店舗・作品にいいねしてみましょう</div>
          </div>
        ) : entries.map(([name, data]) => (
          <div key={name}
            onClick={() => { onNavigateMarket && onNavigateMarket(data.shop, name); }}
            style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"13px 14px",marginBottom:9,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
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
// MY PAGE（マイページメイン + オーケストレーター）
// ─────────────────────────────────────────────
export default function MyPage({ citizenId, onNudge, onLogout, followedShops, likedItems, likedShops, onNavigateMarket, blockedShops, onUnblockShop, lang }) {
  const C = useTheme();
  const t = useI18n(lang);
  const [subView, setSubView] = useState(null);

  // EVIカウントアップ — フックはすべての早期returnより前に置く（Rules of Hooks）
  const eviData = [0.62,0.71,0.68,0.80,0.75,0.84,0.91];
  const labels  = ["月","火","水","木","金","土","日"];
  const [eviDisplay, setEviDisplay] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data?.user) setCurrentUserId(data.user.id); });
  }, []);
  useEffect(() => {
    if (subView !== null) return;
    const target = eviData[eviData.length - 1];
    const dur = 1000;
    const steps = 40;
    const step = target / steps;
    let current = 0;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      current = Math.min(step * count, target);
      setEviDisplay(Math.round(current * 100) / 100);
      if (count >= steps) clearInterval(interval);
    }, dur / steps);
    return () => clearInterval(interval);
  }, [subView]);

  const joinedProjects = BOARD_ITEMS_INIT.filter(b => b.status === "充足");

  // サブビュールーティング
  if (subView === "settings")  return <SettingsView  onBack={() => setSubView(null)} onNudge={onNudge} userId={currentUserId}/>;
  if (subView === "inquiry")   return <InquiryView   onBack={() => setSubView(null)} onNudge={onNudge}/>;
  if (subView === "logout")    return <LogoutView    onBack={() => setSubView(null)} onLogout={onLogout} onNudge={onNudge}/>;
  if (subView === "guide")     return <GuideView     onBack={() => setSubView(null)}/>;
  if (subView === "faq")       return <FaqView       onBack={() => setSubView(null)}/>;
  if (subView === "privacy")   return <LegalView onBack={() => setSubView(null)} title="プライバシーポリシー" content={PRIVACY_TEXT}/>;
  if (subView === "terms")     return <LegalView onBack={() => setSubView(null)} title="利用規約" content={TERMS_TEXT}/>;
  if (subView === "commerce")  return <LegalView onBack={() => setSubView(null)} title="特定商取引法に基づく表記" content={COMMERCE_TEXT}/>;
  if (subView === "contact")   return <ContactView onBack={() => setSubView(null)}/>;
  if (subView === "following") return <FollowingView onBack={() => setSubView(null)} followedShops={followedShops} onNavigateMarket={onNavigateMarket}/>;
  if (subView === "liked")     return <LikedView     onBack={() => setSubView(null)} likedItems={likedItems} likedShops={likedShops} onNavigateMarket={onNavigateMarket}/>;
  if (subView === "blocked")   return <BlockList onBack={() => setSubView(null)} blockedShops={blockedShops} onUnblockShop={onUnblockShop}/>;

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72,background:C.bg,color:C.tx}} onScroll={onNudge}>
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
        <div style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 14px 10px",marginBottom:12}}>
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
            <span style={{fontSize:10,color:C.green,fontWeight:700,letterSpacing:"0.06em"}}>最新：{eviDisplay.toFixed(2)}</span>
          </div>
        </div>

        {/* 統計グリッド */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
          {[
            { label:"CA指数", val:"0.888", sub:"Compatibility Alignment" },
            { label:"参加プロジェクト数", val:"3", sub:"累計従事プロジェクト" },
            { label:"登録作品", val:"2", sub:"市台帳登録済資産" },
            { label:"市民歴", val:"12日", sub:"市制施行からの経過" },
          ].map((s) => (
            <div key={s.label} style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"11px 12px"}}>
              <div style={{fontSize:8,color:C.txL,letterSpacing:"0.12em",marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:18,fontWeight:700,color:C.tx,letterSpacing:"0.06em",marginBottom:2}}>{s.val}</div>
              <div style={{fontSize:7.5,color:C.txL,letterSpacing:"0.06em"}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* 参加中プロジェクト */}
        <SectionHead accent={C.navy} label="参加中のプロジェクト" sub="Active Projects"/>
        {joinedProjects.length === 0 ? (
          <div style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:9.5,color:C.txL,letterSpacing:"0.08em"}}>まだ参加中のプロジェクトはありません</div>
            <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em",marginTop:5}}>掲示板からプロジェクトに参加申請してください</div>
          </div>
        ) : (
          joinedProjects.map(p => (
            <div key={p.reg}
              style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"11px 13px",marginBottom:8,cursor:"default",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:8,color:C.txL,letterSpacing:"0.12em",marginBottom:3}}>{p.dept} / {p.reg}</div>
                <div style={{fontSize:11,fontWeight:600,color:C.tx,letterSpacing:"0.03em",lineHeight:1.3}}>{p.title}</div>
                <div style={{fontSize:8,color:C.txM,marginTop:4}}>起案者：{p.lead}</div>
              </div>
              <span style={{background:"rgba(46,107,79,0.1)",color:C.green,fontSize:7.5,padding:"2px 8px",borderRadius:3,fontWeight:600,flexShrink:0,marginLeft:8}}>参加中</span>
            </div>
          ))
        )}

        {/* ソーシャル */}
        <SectionHead accent={C.navy} label="ソーシャル活動" sub="Social"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
          <div onClick={() => setSubView("following")}
            style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
            <div style={{width:38,height:38,borderRadius:8,background:"linear-gradient(135deg,rgba(46,107,79,0.3),rgba(26,57,44,0.5))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:C.green,border:"1px solid rgba(46,107,79,0.3)"}}>◫</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.tx,marginBottom:2}}>フォロー中</div>
              <div style={{fontSize:8.5,color:C.txL}}>{Object.keys(followedShops||{}).length}店舗</div>
            </div>
            <span style={{fontSize:8,color:C.green,fontWeight:600}}>店舗一覧 ›</span>
          </div>
          <div onClick={() => setSubView("liked")}
            style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
            <div style={{width:38,height:38,borderRadius:8,background:"rgba(46,107,79,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.green,border:"1px solid rgba(46,107,79,0.25)"}}>◈</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.tx,marginBottom:2}}>いいね済み</div>
              <div style={{fontSize:8.5,color:C.txL}}>{Object.keys(likedItems||{}).length}件</div>
            </div>
            <span style={{fontSize:8,color:C.green,fontWeight:600}}>作品一覧 ›</span>
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
          <div key={m.key} onClick={() => setSubView(m.key)} style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:m.key==="logout"?C.red:C.tx,letterSpacing:"0.04em",marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em"}}>{m.sub}</div>
            </div>
            <span style={{color:C.txL,fontSize:14}}>›</span>
          </div>
        ))}

        {/* サポート */}
        <SectionHead accent={C.navy} label="サポート" sub="Support"/>
        {[
          { key:"guide", label:"市民ガイドブック",   sub:"各タブの使い方・チュートリアル" },
          { key:"faq",   label:"よくある質問",       sub:"FAQ" },
        ].map((m) => (
          <div key={m.key} onClick={() => setSubView(m.key)} style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
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
          <div key={m.key} onClick={() => setSubView(m.key)} style={{...C.glass,background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
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
