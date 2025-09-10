import React, { useState } from "react";
import { words } from "../data/words";
import { CheckCircle2 } from "lucide-react";

export default function Quiz({ onFinish }) {
    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(0);

    const current = words[step];

    const handleSelect = (idx) => {
        setSelected(idx);
        if (idx === current.answer) setCorrect((c) => c + 1);
        setTimeout(() => {
            setSelected(null);
            if (step + 1 < words.length) setStep((s) => s + 1);
            else onFinish();
        }, 800);
    };

    return (
        <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow w-96">
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
                    </button>
                ))}
            </div>
            <div className="text-sm text-gray-600">{step + 1}/{words.length}</div>
        </div>
    );
}