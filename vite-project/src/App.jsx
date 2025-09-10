import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import HNSetup from "./components/HNSetup";
import Home from "./components/Home";
import Quiz from "./components/Quiz";

export default function App() {
  const [screen, setScreen] = useState("login");

  // ログイン状態の監視（ローカルストレージ参照）
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const info = JSON.parse(userInfo);
      // ニックネームなければHN設定、それ以外はHome
      setScreen(info.nickname ? "home" : "hnsetup");
    }
  }, []);

  // 画面遷移用コールバック
  const handleLoginSuccess = (isFirstLogin) => {
    setScreen(isFirstLogin ? "hnsetup" : "home");
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setScreen("login");
  };

  return (
    <div className="w-[1280px] h-[775px] flex items-center justify-center bg-[#E5E3D5] mx-auto">
      {screen === "login" && <Login onLoginSuccess={handleLoginSuccess} />}
      {screen === "hnsetup" && <HNSetup onSetup={() => setScreen("home")} onLogout={handleLogout} />}
      {screen === "home" && <Home onStartQuiz={() => setScreen("quiz")} onLogout={handleLogout} />}
      {screen === "quiz" && <Quiz onFinish={() => setScreen("home")} />}
    </div>
  );
}