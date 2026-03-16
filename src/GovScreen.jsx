import { useState } from "react";
// constants imported;
import { SectionHead } from "./components.jsx";
import { useI18n } from "./i18n.js";
import { useTheme } from "./ThemeContext.jsx";

const MAYOR_POSTS = [
  {
    id:1, date:"2026.03.09",
    title:"第三区 再開発プロジェクトについて",
    body:"第三区の再開発プロジェクトが順調に進行しています。現在、11名の市民クリエイターが参加中です。竣工予定は2026年5月を見込んでいます。引き続き、市民の皆さまのご参加をお待ちしております。",
    comments:[
      { id:1, from:"Kento", time:"09:14", text:"先日の説明会に参加しました。非常にワクワクするプロジェクトですね！" },
      { id:2, from:"Saki",  time:"10:32", text:"グラフィック担当として参加申請しました。完成が楽しみです。" },
    ]
  },
  {
    id:2, date:"2026.03.06",
    title:"2026年上半期 市民表彰について",
    body:"2026年上半期の活動において特に貢献した市民を表彰します。対象は、プロジェクト完遂数・登録作品数・EVI指数の複合評価で選定されます。詳細は広報局からのお知らせをご確認ください。",
    comments:[
      { id:1, from:"Reo", time:"14:20", text:"EVI指数が評価基準に含まれているのは良い取り組みですね。" },
    ]
  },
  {
    id:3, date:"2026.02.28",
    title:"市民の皆さまへ — 2周年に向けて",
    body:"池本市の市制施行から間もなく1年が経過しようとしています。これもひとえに市民の皆さまの積極的な参加の賜物です。次のマイルストーンとして2周年記念プロジェクトを準備中です。",
    comments:[]
  },
];

export default function GovScreen({ onNudge, lang }) {
  const C = useTheme();
  const t = useI18n(lang);
  const [openPost, setOpenPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [postedComments, setPostedComments] = useState({});

  const postComment = (postId) => {
    const txt = (commentInputs[postId] || "").trim();
    if (!txt) return;
    setPostedComments(p => ({
      ...p,
      [postId]: [...(p[postId] || []), { id:Date.now(), from:"開発局員", time:"今", text:txt }]
    }));
    setCommentInputs(p => ({ ...p, [postId]:"" }));
    onNudge();
  };

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:72}} onScroll={onNudge}>
      <div style={{padding:"15px 14px 0"}}>
        <SectionHead accent={C.navy} label={t.gov_title} sub={t.gov_sub}/>

        {/* 市政概要 */}
        <div style={{background:C.navy,borderRadius:9,padding:"16px 15px",marginBottom:14,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-24,right:-24,width:100,height:100,borderRadius:"50%",background:"rgba(46,107,79,0.1)"}}/>
          <div style={{color:"rgba(143,168,200,0.45)",fontSize:7.5,letterSpacing:"0.22em",marginBottom:6}}>CITY OVERVIEW</div>
          <div style={{color:"#dde8f5",fontSize:15,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>池本市の理念</div>
          <div style={{fontSize:9.5,color:"rgba(200,214,230,0.8)",lineHeight:1.8,letterSpacing:"0.04em"}}>「創像が集ねる市、現実が結ぶ市」。4つの主要区域（行政区・商業区・市民生活区・工廠区）と市民の内外協働により、池本市はクリエイティブエコノミーの確立を目指します。</div>
        </div>

        {/* 財政報告 */}
        <SectionHead accent={C.navy} label="財政報告" sub="Financial Report"/>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,padding:"14px 15px",marginBottom:14}}>
          <div style={{fontSize:8,color:C.txL,letterSpacing:"0.12em",marginBottom:10}}>2026年3月度 月次報告</div>
          {[
            {k:"総税収（月次）",v:"¥4,832万",up:true},
            {k:"インフラ維持税収入",v:"¥724,800",up:false},
            {k:"市内取引総額",v:"¥3億2,150万",up:true},
            {k:"登録作品数",v:"16件",up:true},
            {k:"市民登録数",v:"31名",up:true},
            {k:"プロジェクト完了数（月次）",v:"2件",up:false},
          ].map(({k,v,up}) => (
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+C.borderD,padding:"7px 0"}}>
              <span style={{fontSize:9,color:C.txL,letterSpacing:"0.06em"}}>{k}</span>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:10,color:C.tx,fontWeight:600,letterSpacing:"0.06em"}}>{v}</span>
                {up !== undefined && (<span style={{fontSize:8,color:up?"#4caf7d":C.txL}}>{up?"↑":"→"}</span>)}
              </div>
            </div>
          ))}
          <div style={{marginTop:10,padding:"8px 10px",background:"rgba(46,107,79,0.07)",border:"1px solid rgba(46,107,79,0.2)",borderRadius:6}}>
            <div style={{fontSize:8,color:C.txM,lineHeight:1.7}}>前月比 +7.2%。商業区の作品取引数増加が主因。インフラ維持税率は現行1.5%を維持。</div>
          </div>
        </div>

        {/* 市議会報告書 */}
        <SectionHead accent={C.navy} label="市議会報告書" sub="Council Report"/>
        {[
          {month:"2026.03", title:"第12回市議会定期報告", tags:["商業区データ更新","CA指数基準見直し"]},
          {month:"2026.02", title:"第11回市議会定期報告", tags:["現実転写プロトコル改定"]},
          {month:"2026.01", title:"第10回市議会臨時報告", tags:["商業区再編","市資産登録規約制定"]},
        ].map((r) => (
          <div key={r.month} style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"12px 14px",marginBottom:8}}>
            <div style={{fontSize:8,color:C.txL,letterSpacing:"0.12em",marginBottom:4}}>{r.month}</div>
            <div style={{fontSize:11,fontWeight:600,color:C.tx,marginBottom:7}}>{r.title}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {r.tags.map(tag => (
                <span key={tag} style={{background:C.bg,border:"1px solid "+C.border,color:C.txM,fontSize:8,padding:"2px 8px",borderRadius:3,letterSpacing:"0.04em"}}>{tag}</span>
              ))}
            </div>
          </div>
        ))}

        {/* 広報局 */}
        <SectionHead accent={C.navy} label="広報局" sub="Public Relations"/>
        {[
          {date:"2026.03.09", label:"重要通達", title:"商業区登録作品数が16件に到達しました"},
          {date:"2026.03.07", label:"お知らせ", title:"インフラ維持税率の定期見直しについて"},
          {date:"2026.03.04", label:"重要通達", title:"第三区再開発プロジェクトの進捗報告"},
          {date:"2026.02.28", label:"お知らせ", title:"2026年上半期 第五回市民白書の公開について"},
          {date:"2026.02.20", label:"重要通達", title:"商業区初回特別展示会の開催お知らせ"},
          {date:"2026.02.15", label:"お知らせ", title:"新規市民登録システムのアップデートが完了しました"},
        ].map((n,i) => (
          <div key={i} style={{background:C.card,border:"1px solid "+C.border,borderRadius:7,padding:"11px 14px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{flexShrink:0}}>
              <div style={{fontSize:7.5,color:C.txL,marginBottom:3}}>{n.date}</div>
              <span style={{background:n.label==="重要通達"?"rgba(184,50,40,0.1)":"rgba(26,37,64,0.07)",color:n.label==="重要通達"?C.red:C.txM,fontSize:7.5,padding:"2px 7px",borderRadius:3,letterSpacing:"0.06em"}}>{n.label}</span>
            </div>
            <div style={{fontSize:10,color:C.tx,lineHeight:1.5,letterSpacing:"0.03em"}}>{n.title}</div>
          </div>
        ))}

        {/* ③ 市長室（全セクションの最下部） */}
        <SectionHead accent={C.navy} label="市長室" sub="Mayor's Office"/>
        <div style={{background:C.card,border:"1px solid "+C.border,borderLeft:"3px solid "+C.green,borderRadius:8,padding:"14px 15px",marginBottom:14}}>
          <div style={{fontSize:8,color:C.txL,letterSpacing:"0.14em",marginBottom:8}}>IK-GOV-2026-001 / 市長メッセージ</div>
          <div style={{fontSize:12,fontWeight:700,color:C.tx,marginBottom:8}}>市民の皆さまへ</div>
          <div style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.04em"}}>池本市の市長、変回次郎よりご挨拶申し上げます。有志の市民の相互協務によって、本市は日々成長を続けております。市民各位の様々な表現を容剪なく尊重し、池本市を共に紡いましょう。</div>
          <div style={{marginTop:10,fontSize:8,color:C.txL,letterSpacing:"0.12em",textAlign:"right"}}>市長　変回次郎</div>
        </div>

        {/* 市長室からの投稿（コメント可） */}
        <SectionHead accent={C.navy} label="市長室からの投稿" sub="Mayor's Posts"/>
        {MAYOR_POSTS.map(post => {
          const allComments = [...post.comments, ...(postedComments[post.id] || [])];
          const isOpen = openPost === post.id;
          return (
            <div key={post.id} style={{background:C.card,border:"1px solid "+C.border,borderRadius:8,marginBottom:12,overflow:"hidden"}}>
              <div onClick={() => setOpenPost(isOpen ? null : post.id)} style={{padding:"14px 15px",cursor:"pointer"}}>
                <div style={{fontSize:7.5,color:C.txL,letterSpacing:"0.14em",marginBottom:5}}>{post.date} / 市長　変回次郎</div>
                <div style={{fontSize:12,fontWeight:700,color:C.tx,marginBottom:7,letterSpacing:"0.04em"}}>{post.title}</div>
                <div style={{fontSize:9.5,color:C.txM,lineHeight:1.8,letterSpacing:"0.04em"}}>{post.body}</div>
                <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em"}}>💬 {allComments.length}件のコメント</span>
                  <span style={{fontSize:8,color:C.green,fontWeight:600}}>{isOpen?"閉じる ▲":"コメントを見る ▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{borderTop:"1px solid "+C.border,background:C.bg,padding:"12px 15px"}}>
                  {allComments.length > 0 ? allComments.map(cm => (
                    <div key={cm.id} style={{marginBottom:10,display:"flex",gap:8}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"rgba(143,168,200,0.5)",border:"1px solid "+C.border}}>
                        {cm.from[0]}
                      </div>
                      <div>
                        <div style={{fontSize:8,color:C.txL,marginBottom:3}}>{cm.from} <span style={{opacity:0.5}}>{cm.time}</span></div>
                        <div style={{fontSize:9.5,color:C.txM,lineHeight:1.65,letterSpacing:"0.03em"}}>{cm.text}</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{fontSize:8.5,color:C.txL,letterSpacing:"0.06em",marginBottom:10}}>まだコメントはありません</div>
                  )}
                  <div style={{display:"flex",gap:7,marginTop:8}}>
                    <input
                      value={commentInputs[post.id] || ""}
                      onChange={e => setCommentInputs(p => ({ ...p, [post.id]:e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") postComment(post.id); }}
                      placeholder="コメントを入力…"
                      style={{flex:1,background:C.card,border:"1px solid "+C.border,borderRadius:6,padding:"7px 10px",color:C.tx,fontSize:9.5,fontFamily:"inherit",outline:"none",letterSpacing:"0.03em"}}
                    />
                    <button onClick={() => postComment(post.id)}
                      style={{padding:"7px 12px",background:(commentInputs[post.id]||"").trim()?C.green:"rgba(46,107,79,0.25)",border:"none",borderRadius:6,color:"#fff",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,transition:"background 0.2s"}}>
                      投稿
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
