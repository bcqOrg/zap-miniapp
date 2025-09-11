import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { signingService } from '../utils/signingService';

export default function Login({ onLoginSuccess }) {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const { response, error: apiError, loading, callApi } = useApi();

    const handleLogin = async (e) => {
        e.preventDefault();
        setAlert({ type: "info", message: "🔄️通信中..." });

        try {
            // 1. ログインAPI
            console.log("[Login] POST /customer-service/auth/login");
            console.log("[Login] リクエスト -> " + JSON.stringify({
                authGroup: "ZM-PLUS",
                loginId,
                //password, 出力しない
            }));
            const dataLogin = await callApi("/customer-service/auth/login", {
                method: "POST",
                body: {
                    authGroup: "ZM-PLUS",
                    loginId,
                    password,
                },
                useAuth: false,
            });
            console.log("[Login] レスポンス -> " + JSON.stringify(dataLogin));

            if (apiError || !dataLogin || dataLogin.loginStatus !== "OK") {
                console.log("[Login] 認証失敗 -> " + apiError);
                setAlert({ type: "error", message: "🚫ログイン失敗（ID・パスワードをご確認ください。）" });
                return;
            }
            console.log("[Login] 認証成功");

            // クッキー保存の待機
            await new Promise(resolve => setTimeout(resolve, 100));

            const cookies = document.cookie.split(';');
            let foundSessionKey = '';
            let foundKeySessionKey = '';
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name && value) {
                    if (name.trim() === 'fnssso_https_sessionkey') foundSessionKey = value.trim();
                    if (name.trim() === 'fnssso_https_key_sessionkey') foundKeySessionKey = value.trim();
                }
            }
            if (foundSessionKey) localStorage.setItem('sessionKey', foundSessionKey);
            if (foundKeySessionKey) {
                localStorage.setItem('keySessionKey', foundKeySessionKey);
                try {
                    const hmacKey = btoa(foundKeySessionKey);
                    signingService.updateHmacKey(hmacKey);
                } catch (error) { }
            }

            // ユーザー情報をlocalStorageに保存
            const hmacKey = btoa(foundKeySessionKey);
            let userInfo = {
                userId: loginId,
                loginTime: dataLogin.result.processingTime,
                hmacKey: hmacKey,
                nickname: null,
            };
            localStorage.setItem("userInfo", JSON.stringify(userInfo));

            // 2. ニックネーム取得API
            console.log("[Nickname] GET /customer-service/member-info/nickname");
            console.log("[Nickname] リクエスト -> なし");
            const dataNick = await callApi("/customer-service/member-info/nickname", {
                method: "GET",
                useAuth: true,
            });
            console.log("[Nickname] レスポンス -> " + JSON.stringify(dataNick));
            if (!apiError && dataNick) {
                userInfo.nickname = dataNick.nickname || null;
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
            }

            setAlert({ type: "success", message: "✅ログイン成功" });
            setTimeout(() => {
                setAlert({ type: "", message: "" });
                const isFirstTime = !userInfo.nickname;
                onLoginSuccess(isFirstTime);
            }, 1000);

        } catch (err) {
            setAlert({ type: "error", message: "🚫ログイン失敗（通信エラーが発生しました。）" });
        }
    };

    // Tailwind Alerts風スタイル
    const alertStyle = {
        info: "bg-blue-50 border border-blue-400 text-blue-700",
        success: "bg-green-50 border border-green-400 text-green-700",
        error: "bg-red-50 border border-red-400 text-red-700",
    };

    return (
        <div
            className="flex items-center justify-center"
            style={{
                width: "1280px",
                height: "775px",
                backgroundColor: "#E5E3D5", // サブカラー
                minHeight: "100vh",
                minWidth: "100vw",
            }}
        >
            <form
                className="flex flex-col items-center bg-white p-12 rounded-xl shadow-lg w-[400px]"
                onSubmit={handleLogin}
            >
                <h2 className="text-3xl font-bold mb-10" style={{ color: "#28600E" }}>
                    ログイン
                </h2>
                <input
                    className="mb-6 p-3 border border-[#7D784A] rounded-[14px] w-full focus:outline-none focus:ring-2 focus:ring-[#28600E] text-gray-900"
                    placeholder="ユーザーID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                />
                <input
                    className="mb-8 p-3 border border-[#7D784A] rounded-[14px] w-full focus:outline-none focus:ring-2 focus:ring-[#28600E] text-gray-900"
                    placeholder="パスワード"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center bg-[#28600E] text-white py-3 w-full rounded-[14px] transition-transform hover:scale-105 font-semibold"
                >
                    <LogIn className="mr-2" size={20} />
                    ログイン
                </button>
                {/* アラートエリア */}
                {alert.message && (
                    <div
                        className={`mt-6 px-4 py-3 rounded-lg w-full text-sm font-medium ${alertStyle[alert.type]}`}
                        role="alert"
                    >
                        {alert.message}
                    </div>
                )}
            </form>
        </div>
    );
}