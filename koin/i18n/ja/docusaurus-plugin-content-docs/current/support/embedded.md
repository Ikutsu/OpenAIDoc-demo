---
title: Koin Embedded
custom_edit_url: null
---
```markdown
Koin Embeddedは、Android/Kotlin SDK & ライブラリの開発者を対象とした、Koinの新しいプロジェクトです。

このプロジェクトは、異なるパッケージ名でKoinプロジェクトを再構築およびパッケージ化するのに役立つスクリプトを提供します。その目的は、SDKとライブラリの開発において、埋め込まれたKoinのバージョンと、Koinの別のバージョンを使用する可能性のある、競合するコンシューミングアプリケーションとの間の競合を回避することです。

フィードバックやご協力が必要ですか？ [Koin Team](mailto:koin@kotzilla.io)までご連絡ください。

## Embedded Version（埋め込みバージョン）

Koinの埋め込みバージョンの例を以下に示します。[Kotzilla Repository](https://repository.kotzilla.io/#browse/browse:Koin-Embedded)
- 利用可能なパッケージ: `embedded-koin-core`、`embedded-koin-android`
- `org.koin.*`から`embedded.koin.*`へのリロケーション

このMavenリポジトリを使用してGradle設定をセットアップします。
```kotlin
maven { 'https://repository.kotzilla.io/repository/kotzilla-platform/' }
```

## Relocation Scripts（再配置スクリプト）

Koinを特定パッケージ名で再構築し、埋め込みを支援し、Koinフレームワークの通常の使用との競合を回避するのに役立つスクリプトを以下に示します。

詳細については、Koinの[relocation scripts](https://github.com/InsertKoinIO/koin-embedded?tab=readme-ov-file#koin-relocation-scripts)プロジェクトを参照してください。
    ```
