import React, { useEffect, useState } from "react";

export default function ProgressBar({ progress }) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            setWidth(progress);
        }, 100);
    }, [progress]);

    return (
        <div className="w-full bg-gray-300 border-2 border-gray-500 rounded-full" style={{ height: '20px' }}>
            <div
                className="bg-[#28600E] rounded-full transition-all duration-500"
                style={{ width: `${width}%`, height: '20px' }}
            ></div>
        </div>
    );
}