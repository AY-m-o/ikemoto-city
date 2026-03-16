import { useState } from "react";
// constants imported;
import { Modal, Btn } from "./components.jsx";
import { useTheme } from "./ThemeContext.jsx";

// ─────────────────────────────────────────────
// STORE PAGE（店舗詳細）
// ─────────────────────────────────────────────
export default function StorePage({ shop, followed, likedShops, onFollowShop, onLikeShop, onBlockShop, onSelectItem, onBack, onNudge }) {
  const C = useTheme();
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [shopReport, setShopReport] = useState(false);
  const [shopReportReason, setShopReportReason] = useState("");
  const [shopReportDone, setShopReportDone] = useState(false);

  const isFollowed = !!followed[shop.name];

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      {/* バナー */}
      <div style={{background:shop.grad,padding:"20px 16px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
        {/* 戻るボタン + 3点メニュー */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <button onClick={() => { onBack(); onNudge(); }}
            style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:5,padding:"4px 10px",color:"rgba(255,255,255,0.8)",fontSize:8.5,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em"}}>
            {"\u2190 店舗一覧"}
          </button>
          <div style={{marginLeft:"auto",position:"relative"}}>
            <button onClick={e => { e.stopPropagation(); setShopMenuOpen(v => !v); }}
              style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",fontSize:18,cursor:"pointer",padding:"0 4px",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
              ⋯
            </button>
            {shopMenuOpen && (
              <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:C.bg,border:"1px solid rgba(0,255,136,0.2)",borderRadius:8,zIndex:300,minWidth:136,boxShadow:"0 4px 20px rgba(0,0,0,0.7)"}} onClick={e => e.stopPropagation()}>
                <button onClick={e => { e.stopPropagation(); setShopMenuOpen(false); setShopReport(true); setShopReportReason(""); setShopReportDone(false); }}
                  style={{display:"block",width:"100%",padding:"11px 14px",background:"transparent",border:"none",color:"rgba(156,163,175,0.8)",fontSize:9.5,cursor:"pointer",fontFamily:"inherit",textAlign:"left",letterSpacing:"0.04em",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  通報する
                </button>
                <button onClick={e => { e.stopPropagation(); setShopMenuOpen(false); onBlockShop && onBlockShop(shop.name); onBack(); }}
                  style={{display:"block",width:"100%",padding:"11px 14px",background:"transparent",border:"none",color:"rgba(255,68,85,0.8)",fontSize:9.5,cursor:"pointer",fontFamily:"inherit",textAlign:"left",letterSpacing:"0.04em"}}>
                  ブロックする
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,marginRight:10}}>
            <div style={{fontSize:7.5,color:"rgba(255,255,255,0.4)",letterSpacing:"0.2em",marginBottom:4}}>REGISTERED SHOP</div>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"0.06em",marginBottom:8}}>{shop.name}</div>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.65)",lineHeight:1.7,letterSpacing:"0.04em"}}>{shop.desc}</div>
            <div style={{marginTop:10,display:"flex",gap:5,flexWrap:"wrap"}}>
              {shop.depts.map(d => (
                <span key={d} style={{background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.75)",fontSize:8,padding:"2px 9px",borderRadius:3}}>{d}</span>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
            <button onClick={e => { e.stopPropagation(); onFollowShop && onFollowShop(shop.name); onNudge(); }}
              style={{minWidth:88,padding:"9px 16px",background:isFollowed?"rgba(0,255,136,0.15)":"rgba(255,255,255,0.14)",border:"1px solid "+(isFollowed?"rgba(0,255,136,0.5)":"rgba(255,255,255,0.28)"),borderRadius:20,color:"#fff",fontSize:9.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em",transition:"all 0.2s",whiteSpace:"nowrap",display:"flex",alignItems:"center",justifyContent:"center",gap:4,boxShadow:isFollowed?"0 0 12px rgba(0,255,136,0.3)":"none"}}>
              {isFollowed
                ? <><span style={{fontSize:11}}>&#10003;</span><span>フォロー中</span></>
                : <><span style={{fontSize:13}}>+</span><span>フォロー</span></>}
            </button>
            <button onClick={e => { e.stopPropagation(); onLikeShop && onLikeShop(shop.name); onNudge(); }}
              style={{minWidth:88,padding:"7px 14px",background:likedShops[shop.name]?"rgba(0,255,136,0.12)":"rgba(255,255,255,0.08)",border:"1px solid "+(likedShops[shop.name]?"rgba(0,255,136,0.4)":"rgba(255,255,255,0.2)"),borderRadius:20,color:likedShops[shop.name]?"#00ff88":"rgba(255,255,255,0.6)",fontSize:9.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.08em",display:"flex",alignItems:"center",gap:4,justifyContent:"center",transition:"all 0.2s"}}>
              <span style={{fontSize:13}}>{likedShops[shop.name]?"◆":"◇"}</span>
              <span>{likedShops[shop.name]?"いいね済":"いいね"}</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 12px"}}>
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.16em",marginBottom:10}}>取扱作品　{shop.items.length} 点</div>
        {shop.items.map(item => (
          <div key={item.reg} className="pressable" onClick={() => { onSelectItem(item); onNudge(); }}
            style={{...C.glass,background:C.card,border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"12px 13px",marginBottom:9,cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:52,height:52,borderRadius:6,background:"linear-gradient(135deg,#1a2540,#131e30)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"rgba(0,255,136,0.15)",border:"1px solid rgba(0,255,136,0.08)"}}>&#x25C9;</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="mono" style={{fontSize:7.5,color:"rgba(156,163,175,0.45)",letterSpacing:"0.12em",marginBottom:3}}>{item.dept} / {item.reg}</div>
              <div style={{fontSize:12,fontWeight:700,color:C.tx,letterSpacing:"0.03em",marginBottom:5,lineHeight:1.3}}>{item.name}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:36,height:2,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:(parseFloat(item.ca)*100)+"%",background:C.green,borderRadius:2}}/>
                  </div>
                  <span className="mono" style={{fontSize:8,color:C.green,fontWeight:600}}>CA {item.ca}</span>
                </div>
                <span className="mono" style={{fontSize:12,fontWeight:700,color:C.green,textShadow:"0 0 8px rgba(0,255,136,0.35)"}}>{item.price}</span>
              </div>
            </div>
            <span style={{color:"rgba(156,163,175,0.3)",fontSize:14,flexShrink:0}}>&#x203A;</span>
          </div>
        ))}
      </div>

      {/* 店舗通報モーダル */}
      {shopReport && (
        <Modal onClose={() => setShopReport(false)}>
          <div style={{fontSize:9,color:C.txL,letterSpacing:"0.18em",marginBottom:14}}>店舗を通報 / {shop.name}</div>
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
              <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:4}}>通報を受け付けました</div>
              <div style={{fontSize:9,color:C.txL}}>内容を確認の上対処いたします。</div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
