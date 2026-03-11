import { C } from "./constants.js";

const EULA_TEXT = `施行日：2026年4月1日

第1条（適用）
本規約は池本市デジタル市役所の利用に関する条件を定めます。

第2条（登録）
正確な情報での登録が必要です。1人1アカウントとします。18歳未満の方は利用できません。

第3条（禁止事項）
・虚偽情報の登録
・他の市民への誹謗中傷
・アプリ外での金銭の授受
・著作権を侵害するコンテンツの出品
・その他法令に違反する行為

第4条（アセットの出品）
出品者は著作権を保有するコンテンツのみ出品できます。売上からインフラ維持税（1.5%）が徴収されます。決済は本市が指定する所定の決済手段を通じて処理されます。

第5条（コンテンツポリシーとゼロトレランス）
不適切なコンテンツ・荒らし行為・ハラスメントに対しては一切容赦しません。違反が確認された場合、警告なしに即座にアカウント停止・永久追放等の措置をとります。通報から24時間以内に運営が対処します。

第6条（免責事項）
市民間のトラブルについて運営は責任を負いません。システム障害による損害について運営は責任を負いません。

第7条（退会）
マイページの設定から退会できます。退会後のデータは削除されます。

第8条（規約の変更）
本規約は予告なく変更する場合があります。

お問い合わせ：info@city-ikemoto.jp`;

export default function EULAScreen({ onAgree }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(8,14,28,0.97)",zIndex:9999,display:"flex",flexDirection:"column",maxWidth:390,margin:"0 auto"}}>
      {/* ヘッダー */}
      <div style={{background:C.navy,borderBottom:"1px solid rgba(46,107,79,0.35)",padding:"18px 18px 14px",flexShrink:0}}>
        <div style={{fontSize:7.5,color:"rgba(143,168,200,0.45)",letterSpacing:"0.22em",marginBottom:6}}>TERMS OF SERVICE</div>
        <div style={{fontSize:16,fontWeight:700,color:"#dde8f5",letterSpacing:"0.08em",marginBottom:4}}>利用規約への同意</div>
        <div style={{fontSize:9,color:"rgba(143,168,200,0.5)",letterSpacing:"0.04em"}}>池本市デジタル市役所をご利用いただくには、以下の規約への同意が必要です。</div>
      </div>

      {/* 規約本文（スクロール可） */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        <div style={{background:"#eef2f8",border:"1px solid #c8d4e8",borderRadius:8,padding:"16px 15px"}}>
          <pre style={{fontSize:9.5,color:"#1a2540",lineHeight:1.9,letterSpacing:"0.03em",whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>
            {EULA_TEXT}
          </pre>
        </div>
        <div style={{height:16}}/>
      </div>

      {/* 同意ボタン（固定フッター） */}
      <div style={{background:C.navy,borderTop:"1px solid rgba(46,107,79,0.35)",padding:"14px 18px 28px",flexShrink:0}}>
        <div style={{fontSize:8.5,color:"rgba(143,168,200,0.45)",letterSpacing:"0.04em",textAlign:"center",marginBottom:12,lineHeight:1.6}}>
          上記の利用規約をご確認の上、同意いただける場合は<br/>下のボタンを押してください
        </div>
        <button onClick={onAgree}
          style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#2e6b4f,#236040)",border:"1px solid rgba(100,200,140,0.4)",borderRadius:9,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.1em",boxShadow:"0 2px 12px rgba(46,107,79,0.3)"}}>
          同意して池本市に入市する
        </button>
      </div>
    </div>
  );
}
