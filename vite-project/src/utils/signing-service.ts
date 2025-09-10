/**
 * HMAC署名サービス
 * セッションベースHMAC-SHA256認証の署名計算と認証ヘッダー生成
 */

import { CryptoService, NonceManager } from './crypto';
// import { SigningError } from '../models/errors'; // これを削除またはコメントアウト

/**
 * 署名対象データの構造
 * Microsoft Learn HMAC認証パターンに準拠
 */
export interface SignatureData {
    /** HTTPメソッド（大文字） */
    method: string;
    /** リクエストパス */
    path: string;
    /** タイムスタンプ（Unix秒） */
    timestamp: string;
    /** リクエストボディ（JSON文字列、GETの場合は空文字） */
    body: string;
}

/**
 * 認証ヘッダーセット
 */
export interface AuthHeaders {
    Authorization: string;
    'X-Nonce': string;
    'X-Timestamp': string;
    'Content-Type': string;
    [key: string]: string;
}

/**
 * HMAC署名サービスクラス
 */
export class SigningService {
    private hmacKey: string = '';

    /**
     * HMAC鍵を更新（セッション作成後に呼び出される）
     */
    updateHmacKey(hmacKey: string): void {
        if (!hmacKey || typeof hmacKey !== 'string') {
            console.error('Invalid HMAC key: must be a non-empty string');
            return;
        }
        console.log(`Updating HMAC key: ${hmacKey}`);
        this.hmacKey = hmacKey;
    }

    /**
     * HMAC鍵が設定されているかチェック
     */
    hasHmacKey(): boolean {
        const hasKey = this.hmacKey !== '';
        console.log(`Has HMAC key: ${hasKey}`);
        return hasKey;
    }

    /**
     * 署名対象文字列を生成
     * Microsoft Learn HMAC認証パターン: method + "\n" + path + "\n" + timestamp + "\n" + body
     */
    private createStringToSign(data: SignatureData): string {
        const stringToSign = `${data.method}\n${data.path}\n${data.timestamp}\n${data.body}`;
        console.log(`String to sign: ${stringToSign}`);
        return stringToSign;
    }

    /**
     * HMAC-SHA256署名を計算
     */
    async calculateHmacSignature(data: SignatureData): Promise<string> {
        if (!this.hasHmacKey()) {
            console.error('HMAC key not set. Call updateHmacKey first.');
            return '';
        }
        const stringToSign = this.createStringToSign(data);
        console.log(`Calculating HMAC signature for string: ${stringToSign}`);
        try {
            const signature = await CryptoService.calculateHmacSha256(this.hmacKey, stringToSign);
            console.log(`Generated signature: ${signature}`);
            return signature;
        } catch (error) {
            console.error(
                `HMAC signature calculation failed: ${error instanceof Error ? error.message : String(error)}`
            );
            return '';
        }
    }

    /**
     * 認証ヘッダーを生成
     */
    async generateAuthHeaders(
        method: string,
        path: string,
        body: string = ''
    ): Promise<AuthHeaders | null> {
        if (!method || !path) {
            console.error('Method and path are required for signature generation');
            return null;
        }
        console.log(`Generating auth headers with method: ${method}, path: ${path}, body: ${body}`);
        try {
            // 各種パラメータ生成
            const nonce = NonceManager.generateNonce();
            const timestamp = CryptoService.getCurrentTimestamp();
            console.log(`Generated nonce: ${nonce}`);
            console.log(`Current timestamp: ${timestamp}`);

            // 署名対象データ構築
            const signatureData: SignatureData = {
                method: method.toUpperCase(),
                path: path.startsWith('/') ? path : `/${path}`,
                timestamp,
                body: body || '',
            };
            console.log(`Signature data: ${JSON.stringify(signatureData)}`);

            // HMAC署名計算
            const signature = await this.calculateHmacSignature(signatureData);
            console.log(`Signature: ${signature}`);

            // 認証ヘッダー構築
            const headers: AuthHeaders = {
                Authorization: `HMAC ${signature}`,
                'X-Nonce': nonce,
                'X-Timestamp': timestamp,
                'Content-Type': 'application/json',
            };
            console.log(`Generated headers: ${JSON.stringify(headers)}`);
            return headers;
        } catch (error) {
            console.error(
                `Auth header generation failed: ${error instanceof Error ? error.message : String(error)}`
            );
            return null;
        }
    }

    /**
     * HMAC鍵をクリア
     */
    clearHmacKey(): void {
        console.log('Clearing HMAC key');
        this.hmacKey = '';
    }
}

// シングルトンインスタンスをエクスポート
export const signingService = new SigningService();