import { useState, useEffect, useCallback, useRef } from "react";
import { C, TICKER, TABS, MARKET_ITEMS, SHOP_META, nudge } from "./constants.js";
import { Stamp, Watermark, RR } from "./components.jsx";
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

// ⑥ 言語切替翻訳データ
const I18N = {
  "JP": { line1:"\u6c60\u672c\u5e02", line2:"\u30c7\u30b8\u30bf\u30eb\u5e02\u5f79\u6240", sub:"IKEMOTO CITY DIGITAL GOVERNMENT",
          board:"\u63b2\u793a\u677f", market:"\u5546\u696d\u533a", gov_tab:"\u884c\u653f", proc:"\u624b\u7d9a\u304d", my:"\u30de\u30a4\u30da\u30fc\u30b8" },
  "EN": { line1:"Ikemoto City", line2:"Digital Office", sub:"IKEMOTO CITY DIGITAL GOVERNMENT",
          board:"BOARD", market:"MARKET", gov_tab:"GOV", proc:"PROC", my:"MY PAGE" },
  "\u97d3":  { line1:"\uc774\ucf00\ubaa8\ud1a0\uc2dc", line2:"\ub514\uc9c0\ud138\uc2dc\uccad", sub:"IKEMOTO CITY DIGITAL GOVERNMENT",
          board:"\uac8c\uc2dc\ud310", market:"\uc2dc\uc7a5", gov_tab:"\ud589\uc815", proc:"\uc808\ucc28", my:"\ub9c8\uc774\ud398\uc774\uc9c0" },
  "\u4e2d":  { line1:"\u6c60\u672c\u5e02", line2:"\u6570\u5b57\u5e02\u653f\u5385", sub:"IKEMOTO CITY DIGITAL GOVERNMENT",
          board:"\u516c\u544a\u680f", market:"\u5546\u4e1a\u533a", gov_tab:"\u884c\u653f", proc:"\u624b\u7eed", my:"\u6211\u7684\u9875\u9762" },
  "ES": { line1:"Ciudad Ikemoto", line2:"Oficina Digital", sub:"IKEMOTO CITY DIGITAL GOVERNMENT",
          board:"TABL\u00d3N", market:"MERCADO", gov_tab:"GOB", proc:"TR\u00c1MITE", my:"MI P\u00c1G" },
};


// ベルアイコン（白・細線・赤い点バッジのみ）
function BellIcon({ hasUnread }) {
  return (
    <div style={{position:"relative",width:15,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
        <path d="M7.5 1.5C7.5 1.5 4 3.5 4 8V11.5H11V8C11 3.5 7.5 1.5 7.5 1.5Z" stroke="#00ff88" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
        <path d="M4 11.5H11L11.8 13H3.2L4 11.5Z" stroke="#00ff88" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
        <path d="M6.2 13.5C6.2 13.5 6.5 14.8 7.5 14.8C8.5 14.8 8.8 13.5 8.8 13.5" stroke="#00ff88" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <line x1="7.5" y1="0.5" x2="7.5" y2="1.8" stroke="#00ff88" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      {hasUnread && <div style={{position:"absolute",top:1,right:0,width:5,height:5,borderRadius:"50%",background:"#ff4455",boxShadow:"0 0 4px rgba(255,68,85,0.8)",border:"1px solid rgba(6,11,21,0.9)"}}/>}
    </div>
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
  // ⑦ 市民証スキャンアニメーション
  const [showScan, setShowScan]         = useState(false);
  // ⑩ 3D回転
  const [cardFlipped, setCardFlipped]   = useState(false);
  const longPressRef                    = useRef(null);
  const scanTimerRef                    = useRef(null);
  const startLongPress = () => {
    longPressRef.current = setTimeout(() => setCardFlipped(v => !v), 600);
  };
  const cancelLongPress = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };
  // ⑦ 市民証ボタンタップ：スキャンアニメーション後に表示
  const handleIdBtn = () => {
    if (showId) { setShowId(false); setCardFlipped(false); return; }
    setShowScan(true);
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = setTimeout(() => { setShowScan(false); setShowId(true); }, 800);
  };
  useEffect(() => { return () => { if (scanTimerRef.current) clearTimeout(scanTimerRef.current); }; }, []);

  // 検索
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // タブアニメ
  const [tappedTab, setTappedTab] = useState(null);
  // ② ソーシャルstate（Supabase連携）
  const [followedShops, setFollowedShops] = useState({});
  const [likedItems,    setLikedItems]    = useState({});
  const [likedShops,    setLikedShops]    = useState({});
  const [blockedShops,  setBlockedShops]  = useState({});
  // マーケットへのディープリンク
  const [marketJump, setMarketJump] = useState(null);
  // ⑥ スクロール標高→トリガージャス&フェード
  const [scrolled, setScrolled] = useState(false);
  const [screenKey, setScreenKey] = useState(0);

  // ── Supabaseからいいね・フォローをロード ─────────
  useEffect(() => {
    if (!userId) return;
    fetchLikes(userId).then(data => setLikedItems(data));
    fetchFollows(userId).then(data => setFollowedShops(data));
  }, [userId]);

  // ⑦ コンテンツエリアのスクロール検知
  const contentRef = useRef(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 8);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [tab]);

  // ⑥ タブ切替時にscreenKeyを増加してフェード再生
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setScrolled(false);
    setScreenKey(k => k + 1);
  };

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

  const handleBlockShop = (shopName) => {
    setBlockedShops(p => ({...p, [shopName]: true}));
  };

  // ② 店舗いいね（ローカルのみ）
  const handleLikeShop = (shopName) => {
    setLikedShops(p => {
      if (p[shopName]) { const n = {...p}; delete n[shopName]; return n; }
      return { ...p, [shopName]: true };
    });
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
      <div style={{position:"fixed",inset:0,zIndex:-1,pointerEvents:"none",backgroundImage:"linear-gradient(#1f2937 1px,transparent 1px),linear-gradient(90deg,#1f2937 1px,transparent 1px)",backgroundSize:"32px 32px",opacity:0.3,animation:"gridPulse 8s ease-in-out infinite"}}/>

      {/* ── HEADER ── */}
      <div className={scrolled ? "glass-header" : ""}
        style={{background:scrolled?"rgba(10,15,30,0.75)":"#0a0f1e",position:"sticky",top:0,zIndex:200,borderBottom:"1px solid rgba(0,255,136,0.2)",boxShadow:"0 4px 24px rgba(0,0,0,0.7)",transition:"background 0.3s ease, backdrop-filter 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 13px"}}>
          <div>
            <div style={{color:"rgba(0,255,136,0.3)",fontSize:8,letterSpacing:"0.28em",marginBottom:3,fontWeight:300,fontFamily:"monospace"}}>{I18N[lang].sub}</div>
            <div style={{color:"#f9fafb",fontSize:16,fontWeight:700,letterSpacing:"0.12em",textShadow:"0 0 24px rgba(0,255,136,0.2)",lineHeight:1.25}}>
              <div style={{whiteSpace:"nowrap"}}>{I18N[lang].line1}</div>
              <div style={{whiteSpace:"nowrap"}}>{I18N[lang].line2}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center",position:"relative"}} onClick={e => e.stopPropagation()}>

            {/* ③ 検索アイコン */}
            <button onClick={() => { setShowSearch(v => !v); setShowLangMenu(false); setShowNotif(false); setSearchQuery(""); }}
              style={{height:28,width:28,background:showSearch?"rgba(0,255,136,0.1)":"rgba(255,255,255,0.04)",border:"1px solid "+(showSearch?"rgba(0,255,136,0.5)":"rgba(255,255,255,0.08)"),borderRadius:6,padding:0,cursor:"pointer",color:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s",boxShadow:showSearch?"0 0 8px rgba(0,255,136,0.3)":"none"}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke="#00ff88" strokeWidth="1.3"/>
                <line x1="9" y1="9" x2="12" y2="12" stroke="#00ff88" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>

            {/* 言語ドロップダウン */}
            <div style={{position:"relative"}}>
              <button onClick={() => { setShowLangMenu(v => !v); setShowNotif(false); setShowSearch(false); }}
                style={{height:28,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,padding:"0 9px",cursor:"pointer",color:"#00ff88",fontSize:8.5,letterSpacing:"0.08em",fontWeight:600,fontFamily:"inherit",transition:"all 0.18s",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap",flexShrink:0}}>
                {lang} <span style={{fontSize:7,opacity:0.6}}>&#x25BC;</span>
              </button>
              {showLangMenu && (
                <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:"#0a0f1e",border:"1px solid rgba(0,255,136,0.2)",borderRadius:8,overflow:"hidden",zIndex:400,minWidth:64,boxShadow:"0 4px 24px rgba(0,0,0,0.6),0 0 12px rgba(0,255,136,0.05)"}}>
                  {LANGS.map(l => (
                    <button key={l} onClick={() => { setLang(l); setShowLangMenu(false); }}
                      style={{display:"block",width:"100%",padding:"8px 14px",background:l===lang?"rgba(0,255,136,0.08)":"transparent",border:"none",color:l===lang?"#00ff88":"rgba(156,163,175,0.7)",fontSize:9.5,fontWeight:l===lang?700:400,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,0.04)",textShadow:l===lang?"0 0 6px rgba(0,255,136,0.5)":"none"}}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 通知ベル */}
            <div style={{position:"relative"}}>
              <button onClick={() => { setShowNotif(v => !v); setShowLangMenu(false); setShowSearch(false); if (!readNotif) setReadNotif(true); }}
                style={{height:28,width:28,background:showNotif?"rgba(0,255,136,0.1)":"rgba(255,255,255,0.04)",border:"1px solid "+(showNotif?"rgba(0,255,136,0.4)":"rgba(255,255,255,0.08)"),borderRadius:6,padding:0,cursor:"pointer",color:"#00ff88",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s",boxShadow:showNotif?"0 0 8px rgba(0,255,136,0.25)":"none"}}>
                <BellIcon hasUnread={!readNotif}/>
              </button>
              {showNotif && (
                <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:"#0a0f1e",border:"1px solid rgba(0,255,136,0.15)",borderRadius:8,overflow:"hidden",zIndex:400,width:220,boxShadow:"0 4px 24px rgba(0,0,0,0.6),0 0 16px rgba(0,255,136,0.04)"}}>
                  <div style={{padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:8,color:"rgba(0,255,136,0.4)",letterSpacing:"0.18em",fontFamily:"monospace"}}>通知 // NOTIFICATIONS</div>
                  {NOTIFS.map(n => {
                    const iconMap = { assign:"✔", msg:"◈", doc:"▣" };
                    return (
                      <div key={n.id} style={{padding:"10px 12px",borderBottom:"1px solid rgba(255,255,255,0.03)",display:"flex",gap:8,alignItems:"flex-start"}}>
                        <span style={{fontSize:11,flexShrink:0,marginTop:1,color:"rgba(0,255,136,0.5)"}}>{iconMap[n.icon]||"•"}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:8.5,color:"rgba(249,250,251,0.8)",lineHeight:1.6,letterSpacing:"0.02em"}}>{n.text}</div>
                          <div style={{fontSize:7.5,color:"rgba(107,114,128,0.7)",marginTop:3}}>{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 市民証 押して長押と3D回転（⑩） */}
            <button
              onClick={handleIdBtn}
              onMouseDown={startLongPress}
              onMouseUp={cancelLongPress}
              onTouchStart={startLongPress}
              onTouchEnd={cancelLongPress}
              style={{height:28,background:showId?"rgba(0,255,136,0.12)":"rgba(255,255,255,0.04)",border:"1px solid "+(showId?"rgba(0,255,136,0.5)":"rgba(255,255,255,0.08)"),borderRadius:6,padding:"0 10px",cursor:"pointer",color:"#00ff88",fontSize:9,letterSpacing:"0.08em",fontWeight:600,fontFamily:"inherit",transition:"all 0.18s",whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",boxShadow:showId?"0 0 10px rgba(0,255,136,0.25)":"none",textShadow:showId?"0 0 6px rgba(0,255,136,0.5)":"none"}}>
              {showId ? "x" : "◈ 市民証"}
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

      {/* ⑥ スキャンアニメーションオーバーレイ */}
      {showScan && (
        <div style={{position:"fixed",inset:0,zIndex:1000,pointerEvents:"none",overflow:"hidden"}}>
          <div style={{position:"absolute",left:0,right:0,height:4,background:"linear-gradient(transparent,rgba(0,255,136,0.9),transparent)",animation:"scanLine 0.8s linear forwards",boxShadow:"0 0 20px 4px rgba(0,255,136,0.5)"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(0,255,136,0.03)"}} />
        </div>
      )}

      {/* CITIZEN ID PANEL — ⑨ 3D回転対応 */}
      {showId && (
        <div style={{background:C.navy,padding:"0 14px 14px",animation:"slideDown 0.2s ease",borderBottom:"1px solid rgba(46,107,79,0.35)"}}>
          <div style={{perspective:"800px"}}>
            <div
              onMouseDown={startLongPress} onMouseUp={cancelLongPress}
              onTouchStart={startLongPress} onTouchEnd={cancelLongPress}
              style={{position:"relative",transformStyle:"preserve-3d",transition:"transform 0.6s ease",transform:cardFlipped?"rotateY(180deg)":"rotateY(0deg)",minHeight:122}}>
              {/* 表面 */}
              <div style={{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",position:"absolute",inset:0,background:"linear-gradient(135deg,#1c3050,#0d1c30)",border:"1px solid rgba(46,107,79,0.45)",borderRadius:8,padding:"14px 16px",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(46,107,79,0.08)"}}/>
                <Stamp/>
                <div style={{color:"#5a80a8",fontSize:7.5,letterSpacing:"0.26em",marginBottom:8}}>DIGITAL CITIZEN IDENTIFICATION</div>
                <div className="mono" style={{color:"#dde8f5",fontSize:18,fontWeight:700,letterSpacing:"0.18em",marginBottom:4}}>{citizenId}</div>
                <div style={{color:C.greenL,fontSize:9.5,fontWeight:500,letterSpacing:"0.1em",marginBottom:3}}>市民区分：開発局員</div>
                <div style={{fontSize:9.5,color:"#7a98b8"}}>認証状態：<span style={{color:"#4caf7d",animation:"pulse 2.5s infinite"}}>●</span><span style={{color:"#4caf7d",fontWeight:500}}> 稼働中</span></div>
                <div style={{marginTop:10,paddingTop:9,borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"#3a5070",fontSize:8.5}}>127.0.0.1 / 拡張現実領域</span>
                  <span style={{color:"#3a5070",fontSize:8.5}}>市制施行：2026.02.26</span>
                </div>
                <div style={{position:"absolute",bottom:5,left:"50%",transform:"translateX(-50%)",fontSize:7,color:"rgba(0,255,136,0.2)",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>長押しで裏面表示</div>
              </div>
              {/* 裏面 */}
              <div style={{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)",position:"absolute",inset:0,background:"linear-gradient(135deg,#0d1a22,#111827)",border:"1px solid rgba(0,255,136,0.25)",borderRadius:8,padding:"14px 16px",display:"flex",flexDirection:"column",justifyContent:"center",gap:8}}>
                <div style={{color:"rgba(0,255,136,0.4)",fontSize:7,letterSpacing:"0.3em",fontFamily:"monospace",marginBottom:4}}>// CLASSIFIED — BACK SIDE</div>
                <div style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,255,136,0.1)",borderRadius:4,padding:"8px 10px",fontFamily:"monospace",fontSize:8,color:"rgba(0,255,136,0.6)",lineHeight:1.9}}>
                  <div>NODE: IKEMOTO-ALPHA-7</div>
                  <div>ACCESS_LEVEL: CITIZEN_GRADE_1</div>
                  <div>ISSUED: 2026.02.26</div>
                  <div>STATUS: <span style={{color:"#00ff88"}}>ACTIVE</span></div>
                </div>
                <div style={{width:"100%",height:24,background:"repeating-linear-gradient(90deg,#1a1a1a 0px,#1a1a1a 10px,#000 10px,#000 11px)",borderRadius:3,marginTop:4}}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREENS ── */}
      <div ref={contentRef} key={screenKey} className="screen-fade"
        style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",position:"relative"}}>
        {tab==="board"  && <BoardScreen  key={resetKeys.board}  onNudge={onNudge} lang={lang} citizenId={citizenId}/>}
        {tab==="market" && <MarketScreen key={resetKeys.market} onNudge={onNudge} lang={lang}
          followedShops={followedShops} onFollowShop={handleFollowShop}
          likedItems={likedItems} onLikeItem={handleLikeItem}
          likedShops={likedShops} onLikeShop={handleLikeShop}
          blockedShops={blockedShops} onBlockShop={handleBlockShop}
          jumpTo={marketJump} onJumpClear={() => setMarketJump(null)}/>}
        {tab==="gov"    && <GovScreen    key={resetKeys.gov}    onNudge={onNudge} lang={lang}/>}
        {tab==="proc"   && <ProcScreen   key={resetKeys.proc}   onNudge={onNudge} lang={lang}/>}
        {tab==="my"     && <MyScreen     key={resetKeys.my}     citizenId={citizenId} onNudge={onNudge} onLogout={onLogout} lang={lang}
          followedShops={followedShops} likedItems={likedItems} likedShops={likedShops}
          blockedShops={blockedShops}
          onUnblockShop={shopName => setBlockedShops(p=>{const n={...p};delete n[shopName];return n;})}
          onNavigateMarket={navigateToMarket}/>}
      </div>

      {/* BOTTOM NAV — リキッドグラス風 */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:390,background:"rgba(10,15,30,0.85)",borderTop:"1px solid rgba(0,255,136,0.15)",display:"flex",zIndex:200,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 -4px 32px rgba(0,0,0,0.5)"}}>
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const isTapped = tappedTab === t.id;
          return (
            <button key={t.id} onClick={() => handleTabChange(t.id)}
              style={{flex:1,padding:"9px 0 11px",background:isActive?"rgba(0,255,136,0.04)":"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderTop:isActive?"1.5px solid #00ff88":"1.5px solid transparent",marginTop:-1.5,fontFamily:"inherit",transition:"all 0.14s"}}>
              <span style={{
                fontSize:18,
                lineHeight:1,
                color:isActive?"#00ff88":"#374151",
                transform:isTapped?"translateY(-4px) scale(1.15)":(isActive?"translateY(-2px) scale(1.05)":"translateY(0) scale(1)"),
                transition:"transform 0.15s ease-out, color 0.14s, filter 0.14s",
                display:"inline-block",
                filter:isActive?"drop-shadow(0 0 6px rgba(0,255,136,0.8))":"none",
              }}>{t.icon}</span>
              <span style={{fontSize:8.5,letterSpacing:"0.1em",fontWeight:isActive?700:400,color:isActive?"#00ff88":"#4b5563",transition:"color 0.14s",textShadow:isActive?"0 0 8px rgba(0,255,136,0.5)":"none"}}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <Watermark id={citizenId}/>
      <RR value={rr}/>
    </div>
  );
}
