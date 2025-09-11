/**
 * HMAC署名サービス
 * セッションベースHMAC-SHA256認証の署名計算と認証ヘッダー生成
 */

import { CryptoService, NonceManager } from 'crypto';

/**
 * 署名エラークラス
 */
export class SigningError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'SigningError';
    this.details = details;
  }
}

/**
 * HMAC署名サービスクラス
 */
export class SigningService {
  constructor() {
    this.hmacKey = '';
  }

  /**
   * HMAC鍵を更新（セッション作成後に呼び出される）
   */
  updateHmacKey(hmacKey) {
    if (!hmacKey || typeof hmacKey !== 'string') {
      throw new SigningError('Invalid HMAC key: must be a non-empty string');
    }

    this.hmacKey = hmacKey;
    console.log('HMAC key updated successfully');
  }

  /**
   * HMAC鍵が設定されているかチェック
   */
  hasHmacKey() {
    return this.hmacKey !== '';
  }

  /**
   * 署名対象文字列を生成
   * Microsoft Learn HMAC認証パターン: method + "\n" + path + "\n" + timestamp + "\n" + body
   */
  createStringToSign(method, path, timestamp, body = '') {
    return `${method}\n${path}\n${timestamp}\n${body}`;
  }

  /**
   * HMAC-SHA256署名を計算
   */
  async calculateHmacSignature(method, path, timestamp, body = '') {
    if (!this.hasHmacKey()) {
      throw new SigningError('HMAC key not set. Call updateHmacKey first.');
    }

    try {
      const stringToSign = this.createStringToSign(method, path, timestamp, body);
      console.log('署名対象文字列:', JSON.stringify(stringToSign));

      const signature = await CryptoService.calculateHmacSha256(this.hmacKey, stringToSign);
      console.log('計算された署名:', signature);

      return signature;
    } catch (error) {
      throw new SigningError(
        `HMAC signature calculation failed: ${error instanceof Error ? error.message : String(error)}`,
        {
          method,
          path,
          timestamp,
          body: body.substring(0, 100), // ログ用に最初の100文字のみ
          hmacKeyLength: this.hmacKey.length
        }
      );
    }
  }

  /**
   * 認証ヘッダーを生成
   */
  async generateAuthHeaders(method, path, body = '') {
    if (!method || !path) {
      throw new SigningError('Method and path are required for signature generation');
    }

    try {
      // 各種パラメータ生成
      const nonce = NonceManager.generateNonce();
      const timestamp = CryptoService.getCurrentTimestamp();

      // パスの正規化（先頭にスラッシュを追加）
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      const normalizedMethod = method.toUpperCase();

      console.log('認証ヘッダー生成パラメータ:', {
        method: normalizedMethod,
        path: normalizedPath,
        timestamp,
        nonce,
        bodyLength: body.length
      });

      // HMAC署名計算
      const signature = await this.calculateHmacSignature(
        normalizedMethod,
        normalizedPath,
        timestamp,
        body
      );

      // 認証ヘッダー構築
      const headers = {
        'Authorization': `HMAC ${signature}`,
        'X-Nonce': nonce,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      };

      console.log('生成された認証ヘッダー:', headers);
      return headers;
    } catch (error) {
      if (error instanceof SigningError) {
        throw error;
      }

      throw new SigningError(
        `Auth header generation failed: ${error instanceof Error ? error.message : String(error)}`,
        {
          method,
          path,
          bodyLength: body.length,
          hasHmacKey: this.hasHmacKey()
        }
      );
    }
  }

  /**
   * HMAC鍵をクリア
   */
  clearHmacKey() {
    this.hmacKey = '';
    console.log('HMAC key cleared');
  }
}

// シングルトンインスタンスをエクスポート
export const signingService = new SigningService();
