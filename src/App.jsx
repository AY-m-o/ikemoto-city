import { useState, useEffect } from "react";
import { C } from "./constants.js";
import { GLOBAL_CSS } from "./components.jsx";
import AuthScreen       from "./AuthScreen.jsx";
import AppShell         from "./AppShell.jsx";
import OnboardingScreen from "./OnboardingScreen.jsx";
import EULAScreen       from "./EULAScreen.jsx";
import { supabase } from "./supabase.js";

export default function App() {
  const [loggedIn,    setLoggedIn]    = useState(false);
  const [citizenId,   setCitizenId]   = useState("IK-2026-████");
  const [userId,      setUserId]      = useState(null); // Supabase auth UID
  const [loading,     setLoading]     = useState(true); // セッション確認中

  // オンボーディング
  const [showOnboarding, setShowOnboarding] = useState(false);
  // EULA
  const [eulaAgreed, setEulaAgreed] = useState(() => !!localStorage.getItem("ik_eula_agreed"));

  // ── セッション自動復元 ────────────────────────
  useEffect(() => {
    // 起動時に既存セッションを確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const cid = session.user.user_metadata?.citizen_id || "IK-2026-????";
        setCitizenId(cid);
        setUserId(session.user.id);
        setLoggedIn(true);
      }
      setLoading(false);
    });

    // セッション変化を監視（タブ変更・トークン更新など）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const cid = session.user.user_metadata?.citizen_id || "IK-2026-????";
        setCitizenId(cid);
        setUserId(session.user.id);
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
        setCitizenId("IK-2026-████");
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (id, uid) => {
    setCitizenId(id);
    setUserId(uid);
    setLoggedIn(true);
    const done = localStorage.getItem("ik_onboarding_done");
    if (!done) setShowOnboarding(true);
  };

  const handleOnboardingDone = () => {
    localStorage.setItem("ik_onboarding_done", "1");
    setShowOnboarding(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLoggedIn(false);
    setCitizenId("IK-2026-████");
    setUserId(null);
  };

  // セッション確認中はローディング表示
  if (loading) {
    return (
      <div style={{minHeight:"100vh",background:"#0f1828",display:"flex",justifyContent:"center",alignItems:"center"}}>
        <div style={{color:"rgba(143,168,200,0.4)",fontSize:9.5,letterSpacing:"0.2em"}}>CONNECTING…</div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#0f1828",display:"flex",justifyContent:"center",alignItems:"flex-start"}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{fontFamily:"'Noto Sans JP','Yu Gothic','YuGothic',sans-serif",background:loggedIn?C.bg:C.navy,minHeight:"100vh",width:"100%",maxWidth:390,display:"flex",flexDirection:"column",boxShadow:"0 0 60px rgba(0,0,0,0.35)",position:"relative",overflow:"hidden"}}>
        {/* EULA同意画面（未同意の場合は必ず表示） */}
        {!eulaAgreed && <EULAScreen onAgree={() => { localStorage.setItem("ik_eula_agreed","1"); setEulaAgreed(true); }}/>}

        {/* オンボーディング画面（初回ログイン後）*/}
        {showOnboarding && <OnboardingScreen onDone={handleOnboardingDone}/>}

        {!loggedIn
          ? <AuthScreen onLogin={handleLogin}/>
          : <AppShell citizenId={citizenId} userId={userId} onLogout={handleLogout}/>
        }
      </div>
    </div>
  );
}
