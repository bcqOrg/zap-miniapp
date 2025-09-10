import React, { useState, useEffect } from "react";
import { BarChart2, Play, LogOut } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { useApi } from "../hooks/useApi"; // useApiフックをインポート
import { words } from "../data/words"; // words.jsもインポート

export default function Home({ onStartQuiz, onLogout }) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
    const nickname = userInfo.nickname || "";

    const { callApi, response, error: apiError } = useApi(); // useApiフックを使用
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const getRes = await callApi(
                    "/usage-history-service/usage-histories/Ashir_ZAP/correctIds",
                    {
                        method: "GET",
                        useAuth: true,
                    }
                );
                if (apiError || !getRes) {
                    console.error("Failed to fetch correctIds");
                    return;
                }
                const data = getRes.value;
                const existingIds = data?.correctIds || [];

                const totalWordsCount = words.length;
                const progressPercent = Math.floor((existingIds.length / totalWordsCount) * 100);
                setProgress(progressPercent);
            } catch (error) {
                console.error("Error fetching correctIds:", error);
            }
        };

        fetchProgress();
    }, []);

    return (
        <div className="relative bg-gray-100 p-8 rounded-xl shadow w-96" style={{ overflow: 'visible' }}>
            {/* 背景をカスタムCSSクラスで設定 */}
            <div className="background-layer" />

            {/* 内容部分 */}
            <div className="relative z-10 flex flex-col items-center bg-white p-8 rounded-xl shadow w-full">
                <h2 className="text-2xl font-bold mb-8 text-[#28600E]">ホーム</h2>
                <div className="w-full mb-8">
                    <div className="mb-4 text-lg text-[#28600E]">{nickname} さん</div>
                    <div className="flex items-center mb-2">
                        <BarChart2 className="mr-2" size={18} />
                        <span>進捗</span>
                    </div>
                    <ProgressBar progress={progress} />
                    <div className="text-right text-sm mt-1 text-[#28600E] font-semibold">{progress}%</div>
                </div>
                <button
                    className="flex items-center justify-center bg-[#28600E] text-white py-3 w-full rounded-[14px] mt-8 transition-transform hover:scale-105"
                    onClick={onStartQuiz}
                >
                    <Play className="mr-2" size={18} />
                    テスト開始
                </button>
                <button
                    className="flex items-center justify-center bg-[#7D784A] text-white py-3 w-full rounded-[14px] mt-4 transition-transform hover:scale-105"
                    onClick={onLogout}
                >
                    <LogOut className="mr-2" size={18} />
                    ログアウト
                </button>
            </div>

            {/* カスタムCSSを追加 */}
            <style jsx="true">{`
                .background-layer {
                    position: absolute;
                    inset: 0;
                    z-index: 0; /* 背景を最背面に */
                }
            `}</style>
        </div>
    );
}