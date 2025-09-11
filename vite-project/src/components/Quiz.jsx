import React, { useState, useMemo, useEffect, useRef } from "react";
import { words } from "../data/words"; // 全問題データ
import { CheckCircle2, XCircle } from "lucide-react";
import { useApi } from "../hooks/useApi"; // API呼び出し用フック

export default function Quiz({ onFinish }) {
    const { callApi, response, error: apiError } = useApi();

    // const [correctIds, setCorrectIds] = useState([]);
    const [step, setStep] = useState(0);
    const [result, setResult] = useState(null);
    const [selected, setSelected] = useState(null);
    // const [sessionCorrectIds, setSessionCorrectIds] = useState([]);

    // correctIdsとsessionCorrectIdsをuseRefで管理
    const correctIdsRef = useRef([]);
    const sessionCorrectIdsRef = useRef([]);

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // APIから正解IDを取得
    useEffect(() => {
        const fetchCorrectIds = async () => {
            try {
                console.log("[CorrectIds] GET /usage-history-service/usage-histories/Ashir_ZAP/correctIds");
                console.log("[CorrectIds] リクエスト -> なし");
                const getRes = await callApi(
                    "/usage-history-service/usage-histories/Ashir_ZAP/correctIds",
                    { method: "GET", useAuth: true }
                );
                console.log("[CorrectIds] レスポンス -> " + JSON.stringify(getRes));
                if (apiError) {
                    // 404 Not Found の場合のみ新規作成
                    console.log("aaa"); // これがでないのに
                    // console.warn("正解IDデータが存在しないため新規作成します");
                    // const dataNew = await callApi(
                    //     "/usage-history-service/usage-histories/Ashir_ZAP/correctIds",
                    //     { method: "POST", body: { value: { correctIds: [] } }, useAuth: true }
                    // );
                    // console.log("[CorrectIds] 新規作成 -> " + JSON.stringify(dataNew));
                    // return;
                }
                if (apiError || !getRes) {
                    console.error("正解IDの取得に失敗" + apiError); // これがでる、これもuseStateでエラーを保存しているせい？
                    // TODO 404 Not Found の場合のみ新規作成
                    console.warn("正解IDデータが存在しないため新規作成します");
                    const dataNew = await callApi(
                        "/usage-history-service/usage-histories/Ashir_ZAP/correctIds",
                        { method: "POST", body: { value: { correctIds: [] } }, useAuth: true }
                    );
                    console.log("[CorrectIds] 新規作成 -> " + JSON.stringify(dataNew));
                    return;
                }
                const ids = getRes.value?.correctIds || [];
                // setCorrectIds(ids);
                correctIdsRef.current = ids; // correctIdsを更新
                await wait(500);
                console.log("APIから取得した正解ID配列:", correctIdsRef.current);
            } catch (error) {
                console.error("正解ID取得エラー:", error);

            }
        };
        fetchCorrectIds();
    }, []);

    // 出題問題の配列（correctIdsを除外しID昇順にソート）
    const quizWords = useMemo(() => {
        const remainingWords = words.filter(w => !correctIdsRef.current.includes(w.id));
        remainingWords.sort((a, b) => a.id - b.id);
        const selectedQuestions = remainingWords.slice(0, 5);
        console.log("出題問題の配列:", selectedQuestions);
        return selectedQuestions;
    }, [correctIdsRef.current]);

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

    // APIに正解IDを送信
    const sendCorrectIds = async (ids) => {
        const existingIds = await fetchCorrectIdsFromApi();
        const newIds = [...existingIds, ...ids];
        newIds.sort((a, b) => a - b);
        await updateCorrectIdsApi(newIds);
        correctIdsRef.current = newIds; // 更新
        await wait(500);
        onFinish();
    };

    // sessionCorrectIdsにIDを追加
    const addSessionCorrectId = (id) => {
        sessionCorrectIdsRef.current = [...sessionCorrectIdsRef.current, id];
    };

    // 例：正解したときに呼び出す
    const handleCorrect = () => {
        if (current) {
            addSessionCorrectId(current.id);
        }
    };

    // 最後にsessionCorrectIdsを使いたい場合
    const handleFinish = () => {
        console.log("今回正解したID:", sessionCorrectIdsRef.current);
        sendCorrectIds(sessionCorrectIdsRef.current);
    };

    const handleSelect = async (idx) => {
        if (!current) return;
        if (idx === current.answer) {
            console.log("正解:", current.id);
            setResult("correct");
            // setSessionCorrectIds((ids) => [...ids, current.id]);
            // await wait(100);
            handleCorrect();
        } else {
            console.log("不正解:", current.id);
            setResult("wrong");
            // await wait(100);
        }

        setSelected(idx);
        setTimeout(() => {
            if (step + 1 < quizWords.length) {
                setStep((s) => s + 1);
            } else {
                // 最後の問題終了
                // console.log("今回正解したID:", sessionCorrectIds);
                // sendCorrectIds(sessionCorrectIds);
                handleFinish();
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