import React, { useState, useEffect } from "react";
import { UserPlus, LogOut } from "lucide-react";
import { useApi } from "../hooks/useApi";

export default function HNSetup({ onSetup, onLogout }) {
    const [nickname, setNickname] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const { response, error: apiError, loading, callApi } = useApi();

    // ニックネーム取得API
    useEffect(() => {
        const fetchNickname = async () => {
            try {
                console.log("[Nickname] GET /customer-service/member-info/nickname");
                console.log("[Nickname] リクエスト -> なし");
                const dataNick = await callApi("/customer-service/member-info/nickname", {
                    method: "GET",
                    useAuth: true,
                });
                console.log("[Nickname] レスポンス -> " + JSON.stringify(dataNick));
                if (!apiError && dataNick) {
                    setNickname(dataNick.nickname);
                    userInfo.nickname = dataNick.nickname || null;
                    localStorage.setItem("userInfo", JSON.stringify(userInfo));
                    onSetup();
                }
            } catch (e) {
                // ニックネーム未設定時は何もしない
                console.log("[Nickname] ニックネーム未設定")
            }
        };
        fetchNickname();
    }, [onSetup]);

    // ニックネーム登録API
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!nickname) return setError("ニックネームを入力してください");
        try {
            console.log("[Nickname] POST /customer-service/member-info/nickname");
            console.log("[Nickname] リクエスト -> " + JSON.stringify({
                appId: "Ashir_ZAP",
                nickname,
            }));
            const dataNick = await callApi("/customer-service/member-info/nickname", {
                method: "POST",
                body: {
                    appId: "Ashir_ZAP",
                    nickname,
                },
                useAuth: true,
            });
            console.log("[Nickname] レスポンス -> " + JSON.stringify(dataNick));
            if (!apiError && dataNick) {
                setNickname(dataNick.nickname);
                userInfo.nickname = dataNick.nickname || null;
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                onSetup();
            } else {
                setAlert({ type: "error", message: "🚫登録に失敗しました" });
            }
        } catch (e) {
            console.error(e);
            setAlert({ type: "error", message: "🚫通信に失敗しました" });
        }
    };

    // Tailwind Alerts風スタイル
    const alertStyle = {
        info: "bg-blue-50 border border-blue-400 text-blue-700",
        success: "bg-green-50 border border-green-400 text-green-700",
        error: "bg-red-50 border border-red-400 text-red-700",
    };

    return (
        <form
            className="flex flex-col items-center bg-white p-8 rounded-xl shadow w-[400px]"
            onSubmit={handleRegister}
        >
            <h2 className="text-2xl font-bold mb-8 text-[#28600E]">ニックネーム設定</h2>
            <input
                className="mb-4 p-3 border rounded-[14px] w-full"
                placeholder="ニックネーム"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
            />
            <button
                className="flex items-center justify-center bg-[#28600E] text-white py-3 w-full rounded-[14px] transition-transform hover:scale-105"
                type="submit"
                disabled={loading}
            >
                <UserPlus className="mr-2" size={18} />
                登録
            </button>
            <button
                className="flex items-center justify-center bg-[#7D784A] text-white py-3 w-full rounded-[14px] mt-4 transition-transform hover:scale-105"
                onClick={onLogout}
            >
                <LogOut className="mr-2" size={18} />
                ログアウト
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
    );
}