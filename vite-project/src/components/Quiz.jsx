import React, { useState, useMemo, useEffect } from "react";
import { words } from "../data/words"; // 全問題データ
import { CheckCircle2, XCircle } from "lucide-react";
import { useApi } from "../hooks/useApi"; // API呼び出し用フック

export default function Quiz({ onFinish }) {
    const { callApi, response, error: apiError } = useApi();

    const [correctIds, setCorrectIds] = useState([]);
    const [step, setStep] = useState(0);
    const [result, setResult] = useState(null);
    const [selected, setSelected] = useState(null);
    const [sessionCorrectIds, setSessionCorrectIds] = useState([]);

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // APIから正解IDを取得
    useEffect(() => {
        const fetchCorrectIds = async () => {
            try {
                const getRes = await callApi(
                    "/usage-history-service/usage-histories/Ashir_ZAP/correctIds",
                    { method: "GET", useAuth: true }
                );
                if (apiError || !getRes) {
                    console.error("正解IDの取得に失敗");
                    return;
                }
                const ids = getRes.value?.correctIds || [];
                setCorrectIds(ids);
                await wait(300);
                console.log("APIから取得した正解ID配列:", correctIds);
            } catch (error) {
                console.error("正解ID取得エラー:", error);
            }
        };
        fetchCorrectIds();
    }, []);

    // 出題問題の配列（correctIdsを除外しID昇順にソート）
    const quizWords = useMemo(() => {
        const remainingWords = words.filter(w => !correctIds.includes(w.id));
        remainingWords.sort((a, b) => a.id - b.id);
        const selectedQuestions = remainingWords.slice(0, 5);
        console.log("出題問題の配列:", selectedQuestions);
        return selectedQuestions;
    }, [correctIds]);

    const current = quizWords[step];

    // API呼び出しの共通関数
    const fetchCorrectIdsFromApi = async () => {
        const res = await callApi(
            "/usage-history-service/usage-histories/Ashir_ZAP/correctIds",
            { method: "GET", useAuth: true }
        );
        return res?.value?.correctIds || [];
    };

    const updateCorrectIdsApi = async (ids) => {
        await callApi(
            "/usage-history-service/usage-histories/Ashir_ZAP/correctIds",
            {
                method: "PUT",
                body: { value: { correctIds: Array.from(new Set(ids)) } },
                useAuth: true,
            }
        );
    };

    const sendCorrectIds = async (ids) => {
        const existingIds = await fetchCorrectIdsFromApi();
        const newIds = [...existingIds, ...ids];
        // 配列内を昇順にソート
        newIds.sort((a, b) => a - b);

        await updateCorrectIdsApi(newIds);
        setCorrectIds(newIds);
        await wait(300);
        console.log("correctIds更新:", correctIds);
        onFinish();
    };

    const handleSelect = async (idx) => {
        if (!current) return;
        if (idx === current.answer) {
            console.log("正解:", current.id);
            setResult("correct");
            setSessionCorrectIds((ids) => [...ids, current.id]);
            await wait(100);
        } else {
            console.log("不正解:", current.id);
            setResult("wrong");
            await wait(100);
        }

        setSelected(idx);
        setTimeout(() => {
            if (step + 1 < quizWords.length) {
                setStep((s) => s + 1);
            } else {
                // 最後の問題終了
                console.log("今回正解したID:", sessionCorrectIds);
                sendCorrectIds(sessionCorrectIds);
            }
            setSelected(null);
            setResult(null);
        }, 100);
    };

    // すべての問題が終わったら
    if (quizWords.length === 0 || !current) {
        return (
            <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow w-96">
                <h2 className="text-2xl font-bold mb-8 text-[#28600E]">単語テスト</h2>
                <div className="text-xl font-bold mb-8">すべての問題を正解しました！</div>
                <button
                    className="flex items-center justify-center bg-[#7D784A] text-white py-3 w-full rounded-[14px] mt-4 transition-transform hover:scale-105"
                    onClick={onFinish}
                >
                    <CheckCircle2 className="mr-2" size={18} />
                    終了
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow w-96">
            {/* 問題表示 */}
            <h2 className="text-2xl font-bold mb-8 text-[#28600E]">単語テスト</h2>
            <div className="text-xl font-bold mb-8">{current.question}</div>
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                {current.options.map((opt, idx) => (
                    <button
                        key={idx}
                        className={`py-4 rounded-[14px] border text-lg transition-transform hover:scale-105 ${selected !== null
                            ? idx === current.answer
                                ? "bg-green-200 border-green-500"
                                : idx === selected
                                    ? "bg-red-200 border-red-500"
                                    : "bg-gray-100"
                            : "bg-[#E5E3D5] border-gray-300"
                            }`}
                        onClick={() => selected === null && handleSelect(idx)}
                        disabled={selected !== null}
                    >
                        {opt}
                        {/* 正解・不正解アイコン */}
                        {selected !== null && idx === current.answer && (
                            <span className="inline-block ml-2 align-middle text-green-600">
                                <CheckCircle2 size={20} />
                            </span>
                        )}
                        {selected !== null && idx === selected && idx !== current.answer && (
                            <span className="inline-block ml-2 align-middle text-red-600">
                                <XCircle size={20} />
                            </span>
                        )}
                    </button>
                ))}
            </div>
            <div className="text-sm text-gray-600">{`${step + 1}/${quizWords.length}`}</div>
            {/* 正解・不正解の通知 */}
            {result === "correct" && (
                <div className="flex items-center text-green-700 mt-2">
                    <CheckCircle2 className="mr-1" size={20} /> 正解！
                </div>
            )}
            {result === "wrong" && (
                <div className="flex items-center text-red-700 mt-2">
                    <XCircle className="mr-1" size={20} /> 不正解
                </div>
            )}
        </div>
    );
}