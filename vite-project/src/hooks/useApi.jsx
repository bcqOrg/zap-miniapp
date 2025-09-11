import { useState } from 'react';
import { signingService } from '../utils/signingService';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);

    const callApi = async (
        url,
        options = {}
    ) => {
        const {
            method = 'GET',
            body = null,
            useAuth = true,
        } = options;

        setLoading(true);
        setError(null);

        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            console.log('useAuth: ' + useAuth);

            if (useAuth) {
                const path = url; // プロキシ使用時は相対パスをそのまま使用
                const bodyString = body ? JSON.stringify(body) : '';

                const authHeaders = await signingService.generateAuthHeaders(method, path, bodyString);
                Object.assign(headers, authHeaders);
            }

            const res = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setResponse(data); // 処理が遅いので値が入らないことも、（例）1回目のログインができない
            return data;
        } catch (err) {
            console.error('Error in callApi:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        response,
        error,
        loading,
        callApi,
    };
};