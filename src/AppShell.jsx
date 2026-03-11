import { useState, useEffect, useCallback } from "react";
import { C, TICKER, TABS, MARKET_ITEMS, SHOP_META, nudge } from "./constants.js";
import { Ticker, Stamp, Watermark, RR } from "./components.jsx";
import BoardScreen  from "./BoardScreen.jsx";
import MarketScreen from "./MarketScreen.jsx";
import ProcScreen   from "./ProcScreen.jsx";
import GovScreen    from "./GovScreen.jsx";
import MyScreen     from "./MyScreen.jsx";
import { fetchLikes, fetchFollows, toggleLike, toggleFollow } from "./supabase.js";

const LANGS = ["JP", "EN", "\u97d3", "\u4e2d", "ES"];

const NOTIFS = [
  { id:1, icon:"assign", text:"\u30a2\u30b5\u30a4\u30f3\u7533\u8acb\u304c\u627f\u8a8d\u3055\u308c\u307e\u3057\u305f\u3002\u300c\u5e02\u6c11\u767d\u66f8 \u7b2c\u4e8c\u7ae0 \u6620\u50cf\u5316\u300d\u306b\u53c2\u52a0\u3067\u304d\u307e\u3059\u3002", time:"4\u5206\u524d" },
  { id:2, icon:"msg",    text:"\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u30eb\u30fc\u30e0\u306b\u65b0\u7740\u30e1\u30c3\u30bb\u30fc\u30b8\u304c\u5c4a\u3044\u3066\u3044\u307e\u3059\u3002", time:"20\u5206\u524d" },
  { id:3, icon:"doc",    text:"\u5e02\u8b70\u4f1a\u5831\u544a\u66f8\u304c\u66f4\u65b0\u3055\u308c\u307e\u3057\u305f\u3002\u7b2c12\u56de\u5b9a\u671f\u5831\u544a\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002", time:"2\u6642\u9593\u524d" },
];

// 検索インデックスデータ
const CITIZENS = [
  { id:"IK-2026-0142", name:"Kento", domain:"\u6620\u50cf\u30fb\u5199\u771f" },
  { id:"IK-2026-0091", name:"Saki",  domain:"\u30b0\u30e9\u30d5\u30a3\u30c3\u30af" },
  { id:"IK-2026-0078", name:"Reo",   domain:"\u97f3\u697d\u30fb\u97f3\u97ff" },
  { id:"IK-2026-0063", name:"Mika",  domain:"\u5efa\u7bc9\u30fb\u7a7a\u9593" },
];

// SVG通知ベルアイコン（⑧リデザイン）
function BellIcon({ hasUnread }) {
  return (
    <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
      <path d="M7.5 1.5C7.5 1.5 4 3.5 4 8V11.5H11V8C11 3.5 7.5 1.5 7.5 1.5Z" stroke="rgba(100,140,180,0.75)" strokeWidth="1.2" fill="rgba(46,107,79,0.08)"/>
      <path d="M4 11.5H11L11.8 13H3.2L4 11.5Z" stroke="rgba(100,140,180,0.6)" strokeWidth="1" fill="rgba(20,40,60,0.5)"/>
      <path d="M6.2 13.5C6.2 13.5 6.5 14.8 7.5 14.8C8.5 14.8 8.8 13.5 8.8 13.5" stroke="rgba(100,140,180,0.6)" strokeWidth="1" fill="none"/>
      <rect x="5.5" y="0.5" width="4" height="1.5" rx="0.75" fill="rgba(46,107,79,0.35)" stroke="rgba(46,107,79,0.5)" strokeWidth="0.5"/>
      {hasUnread && <circle cx="11.5" cy="2" r="2" fill="#e05050" stroke="rgba(13,30,48,0.9)" strokeWidth="1"/>}
    </svg>
  );
}

// 検索結果の種別ラベル
function SearchTag({ type }) {
  const map = { asset:["アセット","rgba(46,107,79,0.15)","#3d8a65"], shop:["\u5e97\u8217","rgba(50,80,140,0.15)","#6080c0"], citizen:["\u5e02\u6c11","rgba(100,60,140,0.15)","#9060c0"] };
  const [label, bg, color] = map[type] || ["","",""];
  return <span style={{background:bg,color,fontSize:7.5,padding:"1.5px 7px",borderRadius:3,letterSpacing:"0.08em",fontWeight:600,flexShrink:0}}>{label}</span>;
}

export default function AppShell({ citizenId, userId, onLogout }) {
  const [tab, setTab]           = useState("board");
  const [showId, setShowId]     = useState(false);
  const [rr, setRR]             = useState(4821);
  const [lang, setLang]         = useState("JP");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotif, setShowNotif]       = useState(false);
  const [readNotif, setReadNotif]       = useState(false);
  const [resetKeys, setResetKeys]       = useState({ board:0, market:0, gov:0, proc:0, my:0 });
  // 検索
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // タブアニメ
  const [tappedTab, setTappedTab] = useState(null);
  // ② ソーシャルstate（Supabase連携）
  const [followedShops, setFollowedShops] = useState({});
  const [likedItems,    setLikedItems]    = useState({});
  // マーケットへのディープリンク
  const [marketJump, setMarketJump] = useState(null);

  // ── Supabaseからいいね・フォローをロード ─────────
  useEffect(() => {
    if (!userId) return;
    fetchLikes(userId).then(data => setLikedItems(data));
    fetchFollows(userId).then(data => setFollowedShops(data));
  }, [userId]);

  // マイページから商業区に遷移
  const navigateToMarket = (shop, itemName) => {
    setMarketJump({ shop, itemName: itemName || null });
    setTab("market");
    onNudge();
  };

  const handleFollowShop = async (shopName) => {
    // まずlocalを即座にトグル（Optimistic Update）
    let wasFollowed = false;
    setFollowedShops(p => {
      wasFollowed = !!p[shopName];
      if (wasFollowed) { const n = {...p}; delete n[shopName]; return n; }
      return { ...p, [shopName]: true };
    });
    if (!userId) return; // ゲストはローカルのみ
    try {
      await toggleFollow(userId, shopName);
    } catch {
      // DB失敗→ロールバック
      setFollowedShops(p => {
        if (wasFollowed) return { ...p, [shopName]: true };
        const n = {...p}; delete n[shopName]; return n;
      });
    }
  };

  const handleLikeItem = async (itemName, shop) => {
    // まずlocalを即座にトグル（Optimistic Update）
    let wasLiked = false;
    setLikedItems(p => {
      wasLiked = !!p[itemName];
      if (wasLiked) { const n = {...p}; delete n[itemName]; return n; }
      return { ...p, [itemName]: { shop } };
    });
    if (!userId) return; // ゲストはローカルのみ
    try {
      await toggleLike(userId, itemName, shop);
    } catch {
      // DB失敗→ロールバック
      setLikedItems(p => {
        if (wasLiked) return { ...p, [itemName]: { shop } };
        const n = {...p}; delete n[itemName]; return n;
      });
    }
  };

  const onNudge = useCallback(() => setRR((v) => nudge(v)), []);

  useEffect(() => {
    const t = setInterval(() => setRR((v) => nudge(v)), 8000);
    return () => clearInterval(t);
  }, []);

  const handleTab = (id) => {
    // ⑦ アニメーション
    setTappedTab(id);
    setTimeout(() => setTappedTab(null), 300);

    if (id === tab) {
      setResetKeys(p => ({ ...p, [id]: p[id]+1 }));
    } else {
      setTab(id);
    }
    onNudge();
    setShowLangMenu(false);
    setShowNotif(false);
    setShowSearch(false);
  };

  const closeMenus = () => {
    setShowLangMenu(false);
    setShowNotif(false);
  };

  // ③ 検索ロジック
  const searchResults = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    MARKET_ITEMS.forEach(item => {
      if (item.name.toLowerCase().includes(q) || item.dept.toLowerCase().includes(q)) {
        results.push({ type:"asset", label:item.name, sub:item.shop+" / "+item.price, key:"a"+item.reg });
      }
    });
    [...new Set(MARKET_ITEMS.map(i => i.shop))].forEach(shop => {
      if (shop.toLowerCase().includes(q)) {
        results.push({ type:"shop", label:shop, sub:SHOP_META[shop]?.desc?.slice(0,30)+"..." || "", key:"s"+shop });
      }
    });
    CITIZENS.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) {
        results.push({ type:"citizen", label:c.name, sub:c.id+" / "+c.domain, key:"c"+c.id });
      }
    });
    return results;
  })();

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,animation:"fadeIn 0.4s ease",position:"relative"}} onClick={closeMenus}>
      {/* グリッドパターン背景 */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(46,107,79,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(46,107,79,0.04) 1px,transparent 1px)",backgroundSize:"32px 32px",animation:"gridPulse 6s ease-in-out infinite"}}/>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(180deg,#1a2540,#141d33)",position:"sticky",top:0,zIndex:200,borderBottom:"1px solid rgba(46,107,79,0.55)",boxShadow:"0 2px 16px rgba(0,0,0,0.3),0 1px 0 rgba(46,120,79,0.2)"}}>
        <Ticker text={TICKER}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 15px 9px"}}>
          <div>
            <div style={{color:"rgba(143,168,200,0.45)",fontSize:7.5,letterSpacing:"0.24em",marginBottom:2,fontWeight:300}}>IKEMOTO CITY DIGITAL GOVERNMENT</div>
            <div style={{color:"#e4eaf4",fontSize:14,fontWeight:700,letterSpacing:"0.1em"}}>池本市　デジタル市役所</div>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center",position:"relative"}} onClick={e => e.stopPropagation()}>

            {/* ③ 検索アイコン */}
            <button onClick={() => { setShowSearch(v => !v); setShowLangMenu(false); setShowNotif(false); setSearchQuery(""); }}
              style={{height:28,width:28,background:showSearch?"rgba(46,107,79,0.18)":"rgba(255,255,255,0.06)",border:"1px solid "+(showSearch?"rgba(46,107,79,0.4)":"rgba(255,255,255,0.12)"),borderRadius:6,padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s"}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke="rgba(100,140,178,0.8)" strokeWidth="1.3"/>
                <line x1="9" y1="9" x2="12" y2="12" stroke="rgba(100,140,178,0.8)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>

            {/* 言語ドロップダウン */}
            <div style={{position:"relative"}}>
              <button onClick={() => { setShowLangMenu(v => !v); setShowNotif(false); setShowSearch(false); }}
                style={{height:28,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"0 9px",cursor:"pointer",color:"rgba(100,140,178,0.8)",fontSize:8.5,letterSpacing:"0.08em",fontWeight:600,fontFamily:"inherit",transition:"all 0.18s",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap",flexShrink:0}}>
                {lang} <span style={{fontSize:7,opacity:0.5}}>&#x25BC;</span>
              </button>
              {showLangMenu && (
                <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:"#0d1e30",border:"1px solid rgba(46,107,79,0.4)",borderRadius:7,overflow:"hidden",zIndex:400,minWidth:64,boxShadow:"0 4px 16px rgba(0,0,0,0.4)"}}>
                  {LANGS.map(l => (
                    <button key={l} onClick={() => { setLang(l); setShowLangMenu(false); }}
                      style={{display:"block",width:"100%",padding:"8px 14px",background:l===lang?"rgba(46,107,79,0.2)":"transparent",border:"none",color:l===lang?"#4caf7d":"rgba(143,168,200,0.75)",fontSize:9.5,fontWeight:l===lang?700:400,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 通知ベル */}
            <div style={{position:"relative"}}>
              <button onClick={() => { setShowNotif(v => !v); setShowLangMenu(false); setShowSearch(false); if (!readNotif) setReadNotif(true); }}
                style={{height:28,width:28,background:showNotif?"rgba(46,107,79,0.18)":"rgba(255,255,255,0.06)",border:"1px solid "+(showNotif?"rgba(46,107,79,0.35)":"rgba(255,255,255,0.12)"),borderRadius:6,padding:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s"}}>
                <BellIcon hasUnread={!readNotif}/>
              </button>
              {showNotif && (
                <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:"#0d1e30",border:"1px solid rgba(46,107,79,0.3)",borderRadius:8,overflow:"hidden",zIndex:400,width:220,boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}>
                  <div style={{padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:8,color:"rgba(143,168,200,0.5)",letterSpacing:"0.14em"}}>通知 NOTIFICATIONS</div>
                  {NOTIFS.map(n => {
                    const iconMap = { assign:"✔", msg:"💬", doc:"📄" };
                    return (
                      <div key={n.id} style={{padding:"10px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",gap:8,alignItems:"flex-start"}}>
                        <span style={{fontSize:12,flexShrink:0,marginTop:1,opacity:0.7}}>{iconMap[n.icon]||"•"}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:8.5,color:"rgba(200,220,240,0.8)",lineHeight:1.6,letterSpacing:"0.02em"}}>{n.text}</div>
                          <div style={{fontSize:7.5,color:"rgba(143,168,200,0.4)",marginTop:3}}>{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 市民証 */}
            <button onClick={() => setShowId((v) => !v)} style={{height:28,background:showId?C.green:"rgba(255,255,255,0.06)",border:"1px solid "+(showId?C.green:"rgba(255,255,255,0.12)"),borderRadius:6,padding:"0 10px",cursor:"pointer",color:showId?"#fff":"rgba(100,140,178,0.8)",fontSize:9,letterSpacing:"0.08em",fontWeight:600,fontFamily:"inherit",transition:"all 0.18s",whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center"}}>
              {showId ? "✕" : "◈ 市民証"}
            </button>
          </div>
        </div>

        {/* ③ 検索バー */}
        {showSearch && (
          <div style={{padding:"0 14px 12px",animation:"slideDown 0.18s ease"}} onClick={e => e.stopPropagation()}>
            <div style={{position:"relative"}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                <circle cx="5.5" cy="5.5" r="4" stroke="rgba(100,140,178,0.5)" strokeWidth="1.3"/>
                <line x1="9" y1="9" x2="12" y2="12" stroke="rgba(100,140,178,0.5)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="アセット・店舗・市民を検索"
                style={{width:"100%",padding:"9px 12px 9px 32px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(46,107,79,0.3)",borderRadius:8,color:"#dde8f5",fontSize:11,fontFamily:"inherit",outline:"none",letterSpacing:"0.04em",boxSizing:"border-box",caretColor:C.green}}
              />
            </div>
            {/* 検索結果 */}
            {searchResults.length > 0 && (
              <div style={{marginTop:8,background:"#0d1e30",border:"1px solid rgba(46,107,79,0.3)",borderRadius:8,overflow:"hidden",maxHeight:240,overflowY:"auto"}}>
                {searchResults.map(r => (
                  <div key={r.key} style={{padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",gap:8,alignItems:"center",cursor:"pointer"}}
                    onClick={() => {
                      if (r.type === "asset" || r.type === "shop") { setTab("market"); }
                      else if (r.type === "citizen") { setTab("my"); }
                      setShowSearch(false); setSearchQuery("");
                    }}>
                    <SearchTag type={r.type}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:10,color:"rgba(200,220,240,0.9)",fontWeight:500,letterSpacing:"0.03em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.label}</div>
                      <div style={{fontSize:8,color:"rgba(143,168,200,0.5)",marginTop:2,letterSpacing:"0.04em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.sub}</div>
                    </div>
                    <span style={{color:"rgba(100,140,178,0.4)",fontSize:11,flexShrink:0}}>›</span>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div style={{marginTop:8,background:"#0d1e30",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(143,168,200,0.4)",letterSpacing:"0.08em"}}>「{searchQuery}」に一致する結果はありませんでした</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CITIZEN ID PANEL ── */}
      {showId && (
        <div style={{background:C.navy,padding:"0 14px 14px",animation:"slideDown 0.2s ease",borderBottom:"1px solid rgba(46,107,79,0.35)"}}>
          <div style={{background:"linear-gradient(135deg,#1c3050,#0d1c30)",border:"1px solid rgba(46,107,79,0.45)",borderRadius:8,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(46,107,79,0.08)"}}/>
            <Stamp/>
            <div style={{color:"#5a80a8",fontSize:7.5,letterSpacing:"0.26em",marginBottom:8}}>DIGITAL CITIZEN IDENTIFICATION</div>
            <div style={{color:"#dde8f5",fontSize:18,fontWeight:700,letterSpacing:"0.18em",marginBottom:4}}>{citizenId}</div>
            <div style={{color:C.greenL,fontSize:9.5,fontWeight:500,letterSpacing:"0.1em",marginBottom:3}}>市民区分：開発局員</div>
            <div style={{fontSize:9.5,color:"#7a98b8"}}>認証状態：<span style={{color:"#4caf7d",animation:"pulse 2.5s infinite"}}>●</span><span style={{color:"#4caf7d",fontWeight:500}}> 稼働中</span></div>
            <div style={{marginTop:10,paddingTop:9,borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"#3a5070",fontSize:8.5}}>127.0.0.1 / 拡張現実領域</span>
              <span style={{color:"#3a5070",fontSize:8.5}}>市制施行：2026.02.26</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREENS ── */}
      {tab==="board"  && <BoardScreen  key={resetKeys.board}  onNudge={onNudge}/>}
      {tab==="market" && <MarketScreen key={resetKeys.market} onNudge={onNudge}
        followedShops={followedShops} onFollowShop={handleFollowShop}
        likedItems={likedItems} onLikeItem={handleLikeItem}
        jumpTo={marketJump} onJumpClear={() => setMarketJump(null)}/>}
      {tab==="gov"    && <GovScreen    key={resetKeys.gov}    onNudge={onNudge}/>}
      {tab==="proc"   && <ProcScreen   key={resetKeys.proc}   onNudge={onNudge}/>}
      {tab==="my"     && <MyScreen     key={resetKeys.my}     citizenId={citizenId} onNudge={onNudge} onLogout={onLogout}
        followedShops={followedShops} likedItems={likedItems}
        onNavigateMarket={navigateToMarket}/>}

      {/* ── BOTTOM NAV ── */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:390,background:"linear-gradient(180deg,#171f38,#111828)",borderTop:"1px solid rgba(46,107,79,0.6)",display:"flex",zIndex:200,boxShadow:"0 -4px 20px rgba(0,0,0,0.4),0 -1px 0 rgba(46,120,79,0.15)"}}>
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const isTapped = tappedTab === t.id;
          return (
            <button key={t.id} onClick={() => handleTab(t.id)}
              style={{flex:1,padding:"9px 0 11px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderTop:isActive?"1.5px solid "+C.green:"1.5px solid transparent",marginTop:-1.5,fontFamily:"inherit",transition:"all 0.14s"}}>
              <span style={{
                fontSize:18,
                lineHeight:1,
                color:isActive?"#8fd4a8":"#3a4e68",
                transform:isTapped?"translateY(-4px) scale(1.15)":(isActive?"translateY(-2px) scale(1.05)":"translateY(0) scale(1)"),
                transition:"transform 0.15s ease-out, color 0.14s, filter 0.14s",
                display:"inline-block",
                filter:isActive?"drop-shadow(0 0 5px rgba(46,180,79,0.7))":"none",
              }}>{t.icon}</span>
              <span style={{fontSize:8.5,letterSpacing:"0.08em",fontWeight:500,color:isActive?"#8fd4a8":"#3a4e68",transition:"color 0.14s",textShadow:isActive?"0 0 8px rgba(77,220,120,0.4)":"none"}}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <Watermark id={citizenId}/>
      <RR value={rr}/>
    </div>
  );
}
