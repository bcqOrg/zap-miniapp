import React, { useState, useEffect } from "react";
import { UserPlus, LogOut } from "lucide-react";

export default function HNSetup({ onSetup, onLogout }) {
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ニックネーム取得API
    useEffect(() => {
        const fetchNickname = async () => {
            try {
                const res = await fetch("/customer-service/member-info/nickname", {
                    method: "GET",
                    // credentials: "include", // 必要に応じて
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.nickname) {
                        setNickname(data.nickname);
                        // ローカルストレージにも保存
                        const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
                        userInfo.nickname = data.nickname;
                        localStorage.setItem("userInfo", JSON.stringify(userInfo));
                        onSetup();
                    }
                }
            } catch (e) {
                // ニックネーム未設定時は何もしない
            }
        };
        fetchNickname();
    }, [onSetup]);

    // ニックネーム登録API
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!nickname) return setError("ニックネームを入力してください");
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/customer-service/member-info/nickname", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appId: "Ashir_ZAP",
                    nickname,
                }),
                // credentials: "include", // 必要に応じて
            });
            if (res.ok) {
                // ローカルストレージにも保存
                const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
                userInfo.nickname = nickname;
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                onSetup();
            } else {
                setError("登録に失敗しました");
            }
        } catch (e) {
            setError("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="flex flex-col items-center bg-white p-8 rounded-xl shadow w-96"
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
                className="flex items-center justify-center bg-[#7D784A] text-white py-3 w-full rounded-[14px] transition-transform hover:scale-105"
                type="submit"
                disabled={loading}
            >
                <UserPlus className="mr-2" size={18} />
                登録
            </button>
            {error && <div className="mt-4 text-red-500">{error}</div>}
            <button
                className="flex items-center justify-center bg-[#7D784A] text-white py-3 w-full rounded-[14px] mt-4 transition-transform hover:scale-105"
                onClick={onLogout}
            >
                <LogOut className="mr-2" size={18} />
                ログアウト
            </button>
        </form>
    );
}