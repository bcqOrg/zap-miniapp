# language: ja
Feature: ニックネーム登録
    ユーザがニックネームを登録する操作
    API（POST "/customer-service/member-info/nickname"）を利用

    Background:
        Given API用のプロキシ設定がされている
        And member_profileにニックネームが未登録の状態である:
            | ZAP_MEMBER_ID | PRODUCT_LINE_CODE | NICKNAME | ACCOUNT_TYPE | CREATED_BY | CREATED_AT             | UPDATED_BY | UPDATED_AT              | DELETE_FLAG |
            | 50            | 2013              | null     | paid         | admin      | 2025/07/08 5:00:22.037 | 50         | 2025/09/11 11:40:39.772 | False       |
        And ユーザがログイン済みである

# =======================================================================
# 1. 正常系
# =======================================================================

    Scenario: 1-1. ニックネーム登録成功
        When ユーザがニックネームに "たろう" を入力
        And 登録ボタンを押下
        And member_profileにニックネームが登録される:
            | ZAP_MEMBER_ID | PRODUCT_LINE_CODE | NICKNAME | ACCOUNT_TYPE | CREATED_BY | CREATED_AT             | UPDATED_BY | UPDATED_AT              | DELETE_FLAG |
            | 50            | 2013              | "たろう" | paid         | admin      | 2025/07/08 5:00:22.037 | 50         | 2025/09/11 11:40:39.772 | False       |

# =======================================================================
# 2. 異常系
# =======================================================================

    Scenario: 2-1. 空のニックネームを登録しようとした場合
        When ユーザがニックネームに空文字を入力
        And 登録ボタンを押下
        Then "ニックネームを入力してください" と表示される
        And 登録処理は行われない

    Scenario: 2-3. APIエラー時のハンドリング
        When ユーザがニックネームに "あいうえおかきくけこさしすせそたちつてとな" を入力
        And 登録ボタンを押下
        Then "🚫登録に失敗しました" と表示される
        And ニックネームが登録されない