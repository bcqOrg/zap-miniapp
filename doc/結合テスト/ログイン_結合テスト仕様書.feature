# language: ja
Feature: ログイン
    会員IDとパスワードを入力して、ログイン
    ログインAPI(POST "customer-service/auth/login")を利用

    Background:
        Given API用のプロキシ設定がされている
        And member_accountにテスト用のユーザーデータが登録されている:
            | CUSTOMER_ID | ZAP_MEMBER_ID |	MEMBER_TYPE | ACCOUNT_ISSUE_DATE | ACCOUNT_EXPIRATION_DATE | CREATED_BY | CREATED_AT             | UPDATED_BY | UPDATED_AT              | DELETE_FLAG |
            | 6747572484  | 50            | digital     | 2025/01/01 0:00:00 | 2029/01/01 0:00:00      | admin      | 2025/07/10 8:10:38.987 | admin      |	2025/07/10 17:10:38.986 | False       |

# =======================================================================
# 1. 正常系テスト
# =======================================================================

    Scenario: 1-1. 正常系 - ニックネーム登録前のログイン成功
        Given member_profileにニックネーム登録がされていない:
            | ZAP_MEMBER_ID | PRODUCT_LINE_CODE | NICKNAME | ACCOUNT_TYPE | CREATED_BY | CREATED_AT             | UPDATED_BY | UPDATED_AT              | DELETE_FLAG |
            | 50            | 2013              | null     | paid         | admin      | 2025/07/08 5:00:22.037 | 50         | 2025/09/11 11:40:39.772 | False       |
        When 会員IDに "6747572484" を入力
        And  パスワードに "hbst1234" を入力
        And  ログインボタンを押下
        Then "✅ログイン成功" と表示される
        And  ニックネーム登録画面に遷移
    
    Scenario: 1-2. 正常系 - ニックネーム登録後のログイン成功
        Given member_profileにニックネーム登録がされている:
            | ZAP_MEMBER_ID | PRODUCT_LINE_CODE | NICKNAME | ACCOUNT_TYPE | CREATED_BY | CREATED_AT             | UPDATED_BY | UPDATED_AT              | DELETE_FLAG |
            | 50            | 2013              | "たろう" | paid         | admin      | 2025/07/08 5:00:22.037 | 50         | 2025/09/11 11:40:39.772 | False       |
        When 会員IDに "6747572484" を入力
        And  パスワードに "hbst1234" を入力
        And  ログインボタンを押下
        Then "✅ログイン成功" と表示される
        And  ホーム画面に遷移する

# =======================================================================
# 2. 異常系テスト
# =======================================================================

    Scenario: 2-1. 異常系 - 会員IDのバリデーションエラー
        When 会員IDに "674757248" を入力
        And  パスワードに "hbst1234" を入力
        And  ログインボタンを押下
        Then "🚫ログイン失敗" と表示される
        And  ログイン画面に留まる
    
    Scenario: 2-2. 異常系 - ログイン失敗
        When 会員IDに "6747572484" を入力
        And  パスワードに "aaaa1111" を入力
        And  ログインボタンを押下
        Then "🚫ログイン失敗" と表示される
        And  ログイン画面に留まる
