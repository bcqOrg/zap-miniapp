import { useState } from 'react';
import { signingService } from '../utils/signing-service';

type UseApiOptions = {
    useAuth?: boolean; // 認証ヘッダを付与するかどうか
};

/**
 * API呼び出し用のカスタムフック
 */
export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [response, setResponse] = useState<any>(null);

    /**
     * APIを呼び出す関数
     */
    const callApi = async (
        url: string,
        options: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
            body?: any;
            useAuth?: boolean;
        } = {}
    ) => {
        const {
            method = 'GET',
            body = null,
            useAuth = true,
        } = options;

        setLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            console.log('useAuth: ' + useAuth); // これはログ出力される

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
            // console.log('data: ' + data)
            setResponse(data); // これだと非同期で１回のボタン押下ではできない
            // await new Promise(resolve => setTimeout(resolve, 500));
            return data; // 返す
        } catch (err) {
            console.error('Error in callApi:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    // console.log('response: ' + response)

    return {
        response,
        error,
        loading,
        callApi,
    };
};