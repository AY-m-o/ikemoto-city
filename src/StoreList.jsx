import { useState } from "react";
// constants imported;
import { Modal, Btn } from "./components.jsx";
import { useTheme } from "./ThemeContext.jsx";

// ─────────────────────────────────────────────
// STORE LIST（店舗一覧）
// ─────────────────────────────────────────────
export default function StoreList({ shops, followed, likedShops, onBlockShop, onSelectShop, onNudge, t }) {
  const C = useTheme();
  const [shopMenuOpen, setShopMenuOpen] = useState(null);
  const [shopReport, setShopReport] = useState(null);
  const [shopReportReason, setShopReportReason] = useState("");
  const [shopReportDone, setShopReportDone] = useState(false);
  const [shopEntering, setShopEntering] = useState(false);
  const [shopEnterTarget, setShopEnterTarget] = useState(null);

  const handleShopEnter = (shop) => {
    setShopEntering(true);
    setShopEnterTarget(shop);
    setTimeout(() => {
      setShopEntering(false);
      setShopEnterTarget(null);
      setShopMenuOpen(null);
      onSelectShop(shop);
      onNudge();
    }, 320);
  };

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge} onClick={() => setShopMenuOpen(null)}>
      <div style={{background:C.navy,borderBottom:"1px solid rgba(0,255,136,0.15)",padding:"14px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:2.5,height:13,background:C.green,borderRadius:2,boxShadow:"0 0 6px "+C.green}}/>
          <span style={{fontSize:10,color:"rgba(0,255,136,0.6)",letterSpacing:"0.2em",fontWeight:600}}>{t.market_list_title}</span>
          <span style={{marginLeft:"auto",fontSize:8,color:"rgba(156,163,175,0.3)",letterSpacing:"0.1em"}}>{shops.length} {t.market_shops}</span>
        </div>
      </div>
      <div style={{padding:"12px 12px",background:C.bg}}>
        {shops.map(shop => {
          const isFollowed = !!followed[shop.name];
          return (
            <div key={shop.name} style={{borderRadius:12,marginBottom:16,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",position:"relative"}}>
              {/* 3点ボタン */}
              <button onClick={e => { e.stopPropagation(); setShopMenuOpen(shopMenuOpen===shop.name?null:shop.name); }}
                style={{position:"absolute",top:8,right:8,zIndex:10,background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:18,cursor:"pointer",padding:"0 4px",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                ⋯
              </button>
              {shopMenuOpen===shop.name && (
                <div style={{position:"absolute",top:36,right:8,background:"#0a0f1e",border:"1px solid rgba(0,255,136,0.2)",borderRadius:8,zIndex:300,minWidth:136,boxShadow:"0 4px 20px rgba(0,0,0,0.7)"}} onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setShopMenuOpen(null); setShopReport(shop.name); setShopReportReason(""); setShopReportDone(false); }}
                    style={{display:"block",width:"100%",padding:"11px 14px",background:"transparent",border:"none",color:"rgba(156,163,175,0.8)",fontSize:9.5,cursor:"pointer",fontFamily:"inherit",textAlign:"left",letterSpacing:"0.04em",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    通報する
                  </button>
                  <button onClick={() => { setShopMenuOpen(null); onBlockShop && onBlockShop(shop.name); }}
                    style={{display:"block",width:"100%",padding:"11px 14px",background:"transparent",border:"none",color:"rgba(255,68,85,0.8)",fontSize:9.5,cursor:"pointer",fontFamily:"inherit",textAlign:"left",letterSpacing:"0.04em"}}>
                    ブロックする
                  </button>
                </div>
              )}
              {/* カード本体 */}
              <div onClick={() => handleShopEnter(shop)}
                style={{borderRadius:12,overflow:"hidden",transition:"transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease",transform:shopEntering&&shopEnterTarget?.name===shop.name?"translateX(-100%) scale(0.96)":"translateX(0) scale(1)",opacity:shopEntering&&shopEnterTarget?.name===shop.name?0:1}}>
                <div style={{background:"#111827",padding:"16px 15px 14px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:7,color:"rgba(255,255,255,0.35)",letterSpacing:"0.2em",marginBottom:5}}>REGISTERED SHOP</div>
                      <div style={{fontSize:14,fontWeight:700,color:"#fff",letterSpacing:"0.05em",marginBottom:6}}>{shop.name}</div>
                      <div style={{display:"flex",gap:5}}>
                        {shop.depts.map(d => (
                          <span key={d} style={{background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)",fontSize:7.5,padding:"1px 7px",borderRadius:2,letterSpacing:"0.06em"}}>{d}</span>
                        ))}
                      </div>
                    </div>
                    {isFollowed && (
                      <span style={{background:"rgba(0,255,136,0.15)",color:"#00ff88",fontSize:8,padding:"2px 9px",borderRadius:10,fontWeight:600,letterSpacing:"0.06em",flexShrink:0,marginRight:36,textShadow:"0 0 6px rgba(0,255,136,0.5)"}}>フォロー中</span>
                    )}
                  </div>
                </div>
                <div style={{background:C.card,border:"1px solid "+C.border,borderTop:"none",padding:"10px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em"}}>{t.market_assets} {shop.count} {t.market_items}</span>
                  <span style={{fontSize:8.5,color:C.green,fontWeight:600,letterSpacing:"0.1em",textShadow:"0 0 6px rgba(0,255,136,0.3)"}}>{t.market_go}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 店舗通報モーダル */}
      {shopReport && (
        <Modal onClose={() => setShopReport(null)}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",marginBottom:14}}>店舗を通報 / {shopReport}</div>
          {!shopReportDone ? (
            <>
              <div style={{marginBottom:12}}>
                {["スパム・詐欺","著作権侵害","不適切な内容","その他"].map(r => (
                  <button key={r} onClick={() => setShopReportReason(r)}
                    style={{display:"block",width:"100%",padding:"10px 13px",marginBottom:6,background:shopReportReason===r?"rgba(0,255,136,0.08)":"rgba(255,255,255,0.03)",border:"1px solid "+(shopReportReason===r?"rgba(0,255,136,0.4)":C.border),borderRadius:7,color:shopReportReason===r?"#00ff88":C.txM,fontSize:10,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s"}}>
                    {r}
                  </button>
                ))}
              </div>
              <Btn label="送信" onClick={() => { if(shopReportReason) setShopReportDone(true); }} disabled={!shopReportReason}/>
            </>
          ) : (
            <div style={{background:"rgba(0,255,136,0.06)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:8,padding:"14px 13px",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#00ff88",fontWeight:600,marginBottom:4}}>通報を受け付けました</div>
              <div style={{fontSize:9,color:C.txL}}>内容を確認の上対処いたします。</div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
