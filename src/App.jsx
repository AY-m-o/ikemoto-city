import { useState } from "react";
import { C } from "./constants.js";
import { GLOBAL_CSS } from "./components.jsx";
import AuthScreen       from "./AuthScreen.jsx";
import AppShell         from "./AppShell.jsx";
import OnboardingScreen from "./OnboardingScreen.jsx";
import EULAScreen       from "./EULAScreen.jsx";

export default function App() {
  const [loggedIn,    setLoggedIn]    = useState(false);
  const [citizenId,   setCitizenId]   = useState("IK-2026-████");
  // ⑥ オンボーディング: 初回ログイン後に1回だけ表示
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  // ④ EULA: 初回起動時に必ず表示
  const [eulaAgreed, setEulaAgreed] = useState(() => !!localStorage.getItem("ik_eula_agreed"));

  const handleLogin = (id) => {
    setCitizenId(id);
    setLoggedIn(true);
    // localStorageで既にオンボーディング済みか確認
    const done = localStorage.getItem("ik_onboarding_done");
    if (!done) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingDone = () => {
    localStorage.setItem("ik_onboarding_done", "1");
    setShowOnboarding(false);
    setOnboardingDone(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCitizenId("IK-2026-████");
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f1828",display:"flex",justifyContent:"center",alignItems:"flex-start"}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{fontFamily:"'Noto Sans JP','Yu Gothic','YuGothic',sans-serif",background:loggedIn?C.bg:C.navy,minHeight:"100vh",width:"100%",maxWidth:390,display:"flex",flexDirection:"column",boxShadow:"0 0 60px rgba(0,0,0,0.35)",position:"relative",overflow:"hidden"}}>
        {/* ④ EULA同意画面（未同意の場合は必ず表示） */}
        {!eulaAgreed && <EULAScreen onAgree={() => { localStorage.setItem("ik_eula_agreed","1"); setEulaAgreed(true); }}/>}

        {/* ⑥ オンボーディング画面（初回ログイン後）*/}
        {showOnboarding && <OnboardingScreen onDone={handleOnboardingDone}/>}

        {!loggedIn
          ? <AuthScreen onLogin={handleLogin}/>
          : <AppShell citizenId={citizenId} onLogout={handleLogout}/>
        }
      </div>
    </div>
  );
}
