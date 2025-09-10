/**
 * Web Crypto API を使用した暗号化ユーティリティ
 * HMAC-SHA256署名計算とnonce生成を担当
 */

/**
 * 暗号化サービス
 * Web Crypto API を使用したセキュアな暗号化処理
 */
export class CryptoService {
    /**
     * Web Crypto API の利用可能性チェック
     */
    static isWebCryptoAvailable(): boolean {
        return typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined';
    }

    /**
     * 現在のUnixタイムスタンプを文字列で取得
     */
    static getCurrentTimestamp(): string {
        return Math.floor(Date.now() / 1000).toString();
    }

    /**
     * Uint8ArrayをBase64エンコードする
     */
    static base64Encode(bytes: Uint8Array): string {
        // 文字列に変換
        const binary = String.fromCharCode(...bytes);
        // Base64エンコード
        return btoa(binary);
    }

    /**
     * HMAC-SHA256署名を計算
     * Web Crypto API を使用したセキュアな署名計算
     */
    static async calculateHmacSha256(
        hmacKey: string,
        message: string
    ): Promise<string> {
        if (!this.isWebCryptoAvailable()) {
            throw new Error('Web Crypto API is not available');
        }

        try {
            // HMAC鍵をUTF-8バイト配列に変換
            const keyBytes = new TextEncoder().encode(hmacKey);

            // メッセージをUTF-8バイト配列に変換
            const messageBytes = new TextEncoder().encode(message);

            // HMAC鍵をインポート
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBytes,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );

            // HMAC署名を計算
            const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);

            // 署名結果をBase64エンコードして返す
            return this.base64Encode(new Uint8Array(signature));
        } catch (error) {
            throw new Error(`HMAC-SHA256 calculation failed: ${error}`);
        }
    }
}

/**
 * Nonce管理クラス
 * UUID v4形式のnonce生成と重複チェック
 */
export class NonceManager {
    private static usedNonces = new Set<string>();
    private static readonly MAX_CACHE_SIZE = 1000;

    /**
     * UUID v4形式のnonce生成
     * 暗号学的に安全なランダム値を使用
     */
    static generateNonce(): string {
        if (!CryptoService.isWebCryptoAvailable()) {
            // フォールバック: Math.random() を使用（推奨されない）
            console.warn('Web Crypto API not available, using fallback random generation');
            return this.generateFallbackNonce();
        }

        const randomBytes = new Uint8Array(16);
        crypto.getRandomValues(randomBytes);

        // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        // バージョン(4)とバリアント(10)ビットを設定
        randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // version 4
        randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // variant 10

        // バイト配列を16進文字列に変換してUUID形式にフォーマット
        const hex = Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return [
            hex.substring(0, 8),
            hex.substring(8, 12),
            hex.substring(12, 16),
            hex.substring(16, 20),
            hex.substring(20, 32)
        ].join('-');
    }

    /**
     * フォールバック用nonce生成（Web Crypto API が利用できない場合）
     */
    private static generateFallbackNonce(): string {
        const chars = '0123456789abcdef';
        let result = '';

        for (let i = 0; i < 32; i++) {
            result += chars[Math.floor(Math.random() * 16)];
        }

        // UUID形式にフォーマット
        return [
            result.substring(0, 8),
            result.substring(8, 12),
            '4' + result.substring(13, 16), // version 4
            '8' + result.substring(17, 20), // variant
            result.substring(20, 32)
        ].join('-');
    }

    /**
     * nonce重複チェックとキャッシュ管理
     */
    static isNonceUsed(nonce: string): boolean {
        if (this.usedNonces.has(nonce)) {
            return true;
        }

        // キャッシュサイズ制限
        if (this.usedNonces.size >= this.MAX_CACHE_SIZE) {
            this.usedNonces.clear();
        }

        this.usedNonces.add(nonce);
        return false;
    }

    /**
     * キャッシュ統計情報取得（デバッグ用）
     */
    static getCacheStats(): { size: number; maxSize: number } {
        return {
            size: this.usedNonces.size,
            maxSize: this.MAX_CACHE_SIZE,
        };
    }
}