import { C } from "./constants.js";
import { SubScreenNav } from "./components.jsx";

// ─────────────────────────────────────────────
// BLOCK LIST（ブロックリスト）
// ─────────────────────────────────────────────
export default function BlockList({ onBack, blockedShops, onUnblockShop }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",paddingBottom:72,background:"#0a0f1e",color:"#f9fafb"}}>
      <SubScreenNav label="ブロックリスト" onBack={onBack}/>
      <div style={{padding:"16px 14px 0"}}>
        <div style={{fontSize:8,color:C.txL,letterSpacing:"0.18em",marginBottom:12}}>ブロック中の店舗 // BLOCKED SHOPS</div>
        {Object.keys(blockedShops||{}).length===0 ? (
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:10,padding:"24px 16px",textAlign:"center"}}>
            <div style={{fontSize:11,color:C.txL,letterSpacing:"0.08em"}}>ブロック中の店舗はありません</div>
          </div>
        ) : (
          Object.keys(blockedShops||{}).map(shopName => (
            <div key={shopName} style={{background:C.card,border:"1px solid "+C.border,borderRadius:10,padding:"13px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:10,fontWeight:600,color:C.tx,letterSpacing:"0.04em",marginBottom:3}}>{shopName}</div>
                <div style={{fontSize:8,color:C.txL,letterSpacing:"0.08em"}}>ブロック中</div>
              </div>
              <button onClick={() => onUnblockShop && onUnblockShop(shopName)}
                style={{background:"transparent",border:"1px solid rgba(0,255,136,0.2)",borderRadius:6,padding:"5px 12px",color:"rgba(0,255,136,0.6)",fontSize:8.5,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.06em"}}>
                解除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
