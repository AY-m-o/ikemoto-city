import { useState, useEffect } from "react";
import { C, PURCHASE_LOGS, calcTax, runSequence } from "./constants.js";
import { Btn, Modal, LogTerminal } from "./components.jsx";
import { getStripe } from "./stripe.js";

// ダミーレビューデータ
const DUMMY_REVIEWS = {
  default: [
    { id:1, from:"Kento", rating:5, time:"2026.03.07", text:"期待なり。スペック通りで完成度が高く、CA指数が実際利用とマッチしていました。" },
    { id:2, from:"Mika",  rating:4, time:"2026.03.05", text:"デザインの品質が高いです。少しカスタマイズしやすいとさらに良かったです。" },
    { id:3, from:"Reo",   rating:5, time:"2026.02.28", text:"他の店舗にはないユニークな作風で心指されました。次の作品も期待しています。" },
  ]
};

const DUMMY_COMMENTS = [
  { id:1, from:"Saki",  time:"09:14", text:"この作品すごく気に入っています！商業区で一番お気に入りです。" },
  { id:2, from:"Kento", time:"11:30", text:"このライセンス形態は凍定するプロジェクトに展開しやすくて良いですね。" },
];

// 星評価コンポーネント
export function StarRating({ value, onChange, readonly=false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{display:"flex",gap:3}}>
      {[1,2,3,4,5].map(star => (
        <span key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{fontSize:16,cursor:readonly?"default":"pointer",color:(hover||value)>=star?"#f0c040":"rgba(100,120,140,0.3)",transition:"color 0.1s",lineHeight:1}}>
          ★
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// ASSET DETAIL（作品詳細）
// ─────────────────────────────────────────────
export default function AssetDetail({ item, shopName, onBack, onNudge, likedItems, onLikeItem }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [purchasePhase, setPurchasePhase] = useState(null);
  const [purchaseLogs, setPurchaseLogs] = useState([]);
  const [comments, setComments] = useState(DUMMY_COMMENTS);
  const [commentInput, setCommentInput] = useState("");
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [reviews, setReviews] = useState(DUMMY_REVIEWS.default);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const liked = !!(likedItems && likedItems[item.name]);
  const [likeCount] = useState(Math.floor(Math.random()*20)+3);

  const [showReport, setShowReport] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError,   setCheckoutError]   = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchase") === "success") {
      setPurchaseSuccess(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleStripeCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: item.name, price: item.price, shopName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "checkout session error");
      if (data.url) {
        window.location.href = data.url;
      } else {
        const stripe = await getStripe();
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw new Error(error.message);
      }
    } catch (err) {
      setCheckoutError(err.message);
      setCheckoutLoading(false);
    }
  };

  const { total, tax } = calcTax(item.price);
  const typeLabel = item.type==="physical"?"PHYSICAL":item.type==="digital"?"DIGITAL":"LICENSE";
  const avgRating = reviews.reduce((s,r)=>s+r.rating,0)/reviews.length;

  const slides = [
    "linear-gradient(135deg,#1e2e4a,#131e30)",
    "linear-gradient(135deg,#2a1a3a,#1a0d28)",
    "linear-gradient(135deg,#1a3020,#0d1e14)",
  ];

  const runPurchase = () => {
    setPurchasePhase("running");
    runSequence(PURCHASE_LOGS, setPurchaseLogs, () => setPurchasePhase("done"));
  };

  const handleLike = () => {
    onLikeItem && onLikeItem(item.name, shopName);
    onNudge();
  };

  const sendComment = () => {
    if (!commentInput.trim()) return;
    setComments(p => [...p, { id:Date.now(), from:"開発局員", time:"今", text:commentInput.trim() }]);
    setCommentInput("");
    onNudge();
  };

  const submitReview = () => {
    if (!myRating) return;
    setReviews(p => [{ id:Date.now(), from:"開発局員", rating:myRating, time:"2026.03.10", text:myReview||"レビューなし" }, ...p]);
    setReviewSubmitted(true);
    setMyRating(0);
    setMyReview("");
    onNudge();
  };

  return (
    <>
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}} onScroll={onNudge}>
        {/* スライダー画像 */}
        <div style={{position:"relative",background:slides[slideIdx],height:200,overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:48,color:"rgba(255,255,255,0.07)"}}>&#x25C9;</div>
          <button onClick={onBack}
            style={{position:"absolute",top:12,left:12,background:"rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:5,padding:"5px 11px",color:"rgba(255,255,255,0.8)",fontSize:8.5,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em"}}>
            {"\u2190 "}{shopName || "店舗"}
          </button>
          <button onClick={() => { setShowReport(true); setReportDone(false); setReportReason(""); }}
            style={{position:"absolute",top:10,right:68,background:"rgba(0,0,0,0.32)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:20,padding:"5px 10px",cursor:"pointer",color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1,zIndex:2}}>
            ⋯
          </button>
          <button onClick={handleLike}
            style={{position:"absolute",top:10,right:10,background:liked?"rgba(46,107,79,0.35)":"rgba(0,0,0,0.3)",border:"1px solid "+(liked?"rgba(100,220,140,0.55)":"rgba(255,255,255,0.15)"),borderRadius:20,padding:"5px 11px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all 0.2s",boxShadow:liked?"0 0 12px rgba(46,160,79,0.5)":"none",animation:liked?"likeGlow 0.6s ease":"none",zIndex:2}}>
            <span style={{fontSize:14,color:liked?"#4cdf90":"rgba(200,220,240,0.5)",transition:"color 0.2s",lineHeight:1,pointerEvents:"none"}}>◈</span>
            <span style={{fontSize:9,color:liked?"#7aefb0":"rgba(255,255,255,0.7)",fontWeight:600,pointerEvents:"none"}}>{liked ? likeCount+1 : likeCount}</span>
          </button>
          <div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5}}>
            {slides.map((_,i) => (
              <div key={i} onClick={() => setSlideIdx(i)}
                style={{width:6,height:6,borderRadius:"50%",background:i===slideIdx?"#fff":"rgba(255,255,255,0.3)",cursor:"pointer"}}/>
            ))}
          </div>
        </div>

        <div style={{padding:"14px 14px 0"}}>
          <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
            <span style={{background:"rgba(46,107,79,0.12)",color:C.green,fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.08em",fontWeight:600,border:"1px solid rgba(46,107,79,0.25)"}}>{item.dept}</span>
            <span style={{background:C.bg,border:"1px solid "+C.border,color:C.txL,fontSize:8,padding:"2px 9px",borderRadius:3,letterSpacing:"0.08em"}}>{typeLabel}</span>
            <span style={{marginLeft:"auto",fontSize:7.5,color:C.txL,letterSpacing:"0.1em"}}>{item.reg}</span>
          </div>
          <div style={{fontSize:18,fontWeight:700,color:C.tx,letterSpacing:"0.03em",lineHeight:1.35,marginBottom:10}}>{item.name}</div>

          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <StarRating value={Math.round(avgRating)} readonly={true}/>
            <span style={{fontSize:9.5,color:"#f0c040",fontWeight:700}}>{avgRating.toFixed(1)}</span>
            <span style={{fontSize:8.5,color:C.txL}}>({reviews.length}件)</span>
          </div>

          {/* CA指数バー */}
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"11px 13px",marginBottom:12}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:7}}>CA ALIGNMENT INDEX</div>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{flex:1,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:(parseFloat(item.ca)*100)+"%",background:"linear-gradient(90deg,"+C.green+","+C.greenL+")",borderRadius:3,transition:"width 0.5s ease"}}/>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:C.green,letterSpacing:"0.06em"}}>{item.ca}</span>
            </div>
          </div>

          {/* コンセプト */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:7}}>CONCEPT</div>
            <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"2.5px solid "+C.green,borderRadius:7,padding:"11px 13px"}}>
              <div style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.04em"}}>{item.concept}</div>
            </div>
          </div>

          {/* スペック */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:7}}>SPECIFICATIONS</div>
            <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,overflow:"hidden"}}>
              {item.specs.map((s,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 13px",borderBottom:i<item.specs.length-1?"1px solid "+C.borderD:"none"}}>
                  <span style={{fontSize:9,color:C.txL,letterSpacing:"0.07em"}}>{s.k}</span>
                  <span style={{fontSize:9,color:C.tx,fontWeight:500}}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* コメント欄 */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:9}}>COMMENTS</div>
            {comments.map(cm => (
              <div key={cm.id} style={{marginBottom:9,display:"flex",gap:8}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"rgba(143,168,200,0.5)",border:"1px solid "+C.border}}>{cm.from[0]}</div>
                <div style={{flex:1,background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px"}}>
                  <div style={{fontSize:8,color:C.txL,marginBottom:3}}>{cm.from} <span style={{opacity:0.5}}>{cm.time}</span></div>
                  <div style={{fontSize:9.5,color:C.txM,lineHeight:1.6,letterSpacing:"0.03em"}}>{cm.text}</div>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:7,marginTop:6}}>
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") sendComment(); }}
                placeholder="コメントを入力…"
                style={{flex:1,background:C.card,border:"1px solid "+C.border,borderRadius:6,padding:"7px 10px",color:C.tx,fontSize:9.5,fontFamily:"inherit",outline:"none",letterSpacing:"0.03em"}}
              />
              <button onClick={sendComment}
                style={{padding:"7px 11px",background:commentInput.trim()?C.green:"rgba(46,107,79,0.25)",border:"none",borderRadius:6,color:"#fff",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,transition:"background 0.2s"}}>
                送信
              </button>
            </div>
          </div>

          {/* レビュー */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:9}}>REVIEWS</div>
            {reviews.map(r => (
              <div key={r.id} style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"11px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:600,color:C.tx}}>{r.from}</span>
                    <StarRating value={r.rating} readonly={true}/>
                  </div>
                  <span style={{fontSize:7.5,color:C.txL}}>{r.time}</span>
                </div>
                <div style={{fontSize:9.5,color:C.txM,lineHeight:1.7,letterSpacing:"0.03em"}}>{r.text}</div>
              </div>
            ))}
            {!reviewSubmitted ? (
              <div style={{background:C.bg,border:"1px solid "+C.border,borderRadius:8,padding:"12px 13px",marginTop:10}}>
                <div style={{fontSize:8.5,color:C.txM,letterSpacing:"0.1em",marginBottom:8}}>レビューを投稿する</div>
                <div style={{marginBottom:8}}>
                  <StarRating value={myRating} onChange={setMyRating}/>
                </div>
                <textarea
                  value={myReview}
                  onChange={e => setMyReview(e.target.value)}
                  placeholder="感想を入力（任意）"
                  rows={2}
                  style={{width:"100%",background:C.card,border:"1px solid "+C.border,borderRadius:6,padding:"7px 10px",color:C.tx,fontSize:9.5,fontFamily:"inherit",outline:"none",letterSpacing:"0.03em",resize:"none",lineHeight:1.7,boxSizing:"border-box",marginBottom:8}}
                />
                <button onClick={submitReview} disabled={!myRating}
                  style={{padding:"7px 16px",background:myRating?C.green:"rgba(46,107,79,0.25)",border:"none",borderRadius:6,color:"#fff",fontSize:9,fontWeight:600,cursor:myRating?"pointer":"default",fontFamily:"inherit",transition:"background 0.2s"}}>
                  投稿する
                </button>
              </div>
            ) : (
              <div style={{background:"rgba(46,107,79,0.07)",border:"1px solid rgba(46,107,79,0.25)",borderRadius:7,padding:"10px 12px",marginTop:8}}>
                <div style={{fontSize:9,color:C.green,fontWeight:600}}>レビューを投稿しました</div>
              </div>
            )}
          </div>

          {/* 価格 */}
          <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"13px 14px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,fontWeight:700,color:C.tx}}>登録価格</span>
              <span style={{fontSize:24,fontWeight:700,color:"#00ff88",letterSpacing:"0.04em",textShadow:"0 0 12px rgba(0,255,136,0.4)"}}>{item.price}</span>
            </div>
          </div>

          {item.type === "physical" ? (
            <>
              {checkoutError && (
                <div style={{background:"rgba(184,50,40,0.1)",border:"1px solid rgba(184,50,40,0.35)",borderRadius:7,padding:"9px 13px",marginBottom:10}}>
                  <div style={{fontSize:8.5,color:"#e57a74",lineHeight:1.6}}>{checkoutError}</div>
                </div>
              )}
              <Btn
                label={checkoutLoading ? "接続中…" : "物質化申請（Stripe決済）"}
                onClick={() => { if(!checkoutLoading) handleStripeCheckout(); }}
                disabled={checkoutLoading}
              />
            </>
          ) : (
            <div style={{background:"rgba(26,37,64,0.6)",border:"1px solid "+C.border,borderRadius:8,padding:"13px 16px",marginBottom:8,textAlign:"center"}}>
              <div style={{fontSize:9.5,color:C.txL,letterSpacing:"0.04em",lineHeight:1.8}}>この作品はWebサイトにて</div>
              <div style={{fontSize:9.5,color:C.txL,letterSpacing:"0.04em",lineHeight:1.8}}>ご購入いただけます</div>
              <div style={{marginTop:8,fontSize:8,color:C.txL,letterSpacing:"0.06em"}}>city-ikemoto.jp/market</div>
            </div>
          )}
        </div>
      </div>

      {/* 購入完了モーダル */}
      {purchaseSuccess && (
        <Modal onClose={() => setPurchaseSuccess(false)}>
          <div style={{textAlign:"center",padding:"10px 0"}}>
            <div style={{fontSize:32,marginBottom:12}}>&#x2713;</div>
            <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:6,letterSpacing:"0.06em"}}>購入が完了しました</div>
            <div style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.04em",marginBottom:4}}>{item.name}</div>
            <div style={{fontSize:9,color:C.txL,lineHeight:1.7,marginBottom:16}}>転写プロセスが開始されました。<br/>完了通知をお待ちください。</div>
            <div style={{background:"rgba(46,107,79,0.08)",border:"1px solid rgba(46,107,79,0.25)",borderRadius:7,padding:"10px 14px",marginBottom:16,fontSize:9,color:C.txM,lineHeight:1.7}}>
              領収書はご登録のメールアドレスに送付されます。
            </div>
            <Btn label="閉じる" onClick={() => setPurchaseSuccess(false)} variant="ghost"/>
          </div>
        </Modal>
      )}

      {/* 通報モーダル */}
      {showReport && (
        <Modal onClose={() => setShowReport(false)}>
          {!reportDone ? (
            <>
              <div style={{fontSize:12,fontWeight:700,color:C.tx,marginBottom:4}}>通報</div>
              <div style={{fontSize:9,color:C.txL,marginBottom:14,letterSpacing:"0.04em"}}>通報理由を選択してください</div>
              {["スパム","不適切なコンテンツ","規約違反","その他"].map(reason => (
                <div key={reason} onClick={() => setReportReason(reason)}
                  style={{padding:"11px 13px",borderRadius:7,marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10,background:reportReason===reason?"rgba(46,107,79,0.15)":C.bg,border:"1px solid "+(reportReason===reason?"rgba(46,107,79,0.4)":C.border),transition:"all 0.15s"}}>
                  <div style={{width:14,height:14,borderRadius:"50%",border:"1.5px solid "+(reportReason===reason?C.green:C.txL),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {reportReason===reason && <div style={{width:7,height:7,borderRadius:"50%",background:C.green}}/>}
                  </div>
                  <span style={{fontSize:10,color:C.tx}}>{reason}</span>
                </div>
              ))}
              <div style={{marginTop:10,display:"flex",gap:8}}>
                <button onClick={() => setShowReport(false)} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid "+C.border,borderRadius:7,color:C.txL,fontSize:9.5,cursor:"pointer",fontFamily:"inherit"}}>キャンセル</button>
                <button onClick={() => { if(reportReason) setReportDone(true); }} style={{flex:1,padding:"9px",background:reportReason?C.green:"rgba(46,107,79,0.25)",border:"none",borderRadius:7,color:"#fff",fontSize:9.5,fontWeight:600,cursor:reportReason?"pointer":"default",fontFamily:"inherit",transition:"background 0.2s"}}>送信する</button>
              </div>
            </>
          ) : (
            <div style={{textAlign:"center",padding:"10px 0"}}>
              <div style={{fontSize:13,marginBottom:8}}>&#x2713;</div>
              <div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:5}}>通報を受付けました</div>
              <div style={{fontSize:9,color:C.txL,lineHeight:1.7}}>24時間中に運営が対応いたします。</div>
              <button onClick={() => setShowReport(false)} style={{marginTop:14,padding:"8px 24px",background:C.green,border:"none",borderRadius:7,color:"#fff",fontSize:9.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>閉じる</button>
            </div>
          )}
        </Modal>
      )}

      {/* 購入モーダル */}
      {purchasePhase && (
        <Modal onClose={() => { if (purchasePhase !== "running") setPurchasePhase(null); }}>
          <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:4}}>現実空間への物質化申請</div>
              <div style={{fontSize:13,fontWeight:700,color:C.tx,lineHeight:1.35}}>{item.name}</div>
            </div>
            {purchasePhase !== "running" && (
              <button onClick={() => setPurchasePhase(null)} style={{background:"transparent",border:"none",color:C.txL,fontSize:18,cursor:"pointer",lineHeight:1,padding:0}}>✕</button>
            )}
          </div>
          {purchasePhase === "confirm" && (
            <>
              <div style={{background:C.bg,border:"1px solid "+C.border,borderRadius:8,padding:"13px 14px",marginBottom:14}}>
                {[["登録番号",item.reg],["種別",typeLabel]].map(([k,v]) => (
                  <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:9,color:C.txL}}>{k}</span>
                    <span style={{fontSize:9,color:C.txM,fontWeight:600}}>{v}</span>
                  </div>
                ))}
                <div style={{height:1,background:C.border,margin:"8px 0"}}/>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:C.tx,fontWeight:700}}>登録価格</span>
                  <span style={{fontSize:13,color:"#00ff88",fontWeight:700,textShadow:"0 0 8px rgba(0,255,136,0.35)"}}>{item.price}</span>
                </div>
              </div>
              <Btn label="物質化申請を実行する" onClick={runPurchase}/>
            </>
          )}
          {(purchasePhase==="running"||purchasePhase==="done") && (
            <LogTerminal logs={purchaseLogs} running={purchasePhase==="running"} dark={false}/>
          )}
          {purchasePhase==="done" && (
            <>
              <div style={{background:"rgba(46,107,79,0.08)",border:"1px solid "+C.green,borderRadius:7,padding:"11px 13px",marginBottom:12,marginTop:12}}>
                <div style={{fontSize:10,color:C.green,fontWeight:600,letterSpacing:"0.08em",marginBottom:2}}>申請が完了しました</div>
                <div style={{fontSize:9,color:C.txM,lineHeight:1.7}}>転写プロセスが開始されました。完了通知をお待ちください。</div>
              </div>
              <Btn label="閉じる" onClick={() => setPurchasePhase(null)} variant="ghost"/>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
