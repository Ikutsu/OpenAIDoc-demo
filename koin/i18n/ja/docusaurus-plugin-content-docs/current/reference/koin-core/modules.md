---
title: Modules
---
Koin を使用すると、モジュール内で定義を記述できます。このセクションでは、モジュールの宣言、構成、およびリンクの方法について説明します。

## モジュールとは？

Koin モジュールは、Koin の定義をまとめるための「スペース」です。これは `module` 関数で宣言されます。

```kotlin
val myModule = module {
    // 定義を記述 ...
}
```

## 複数のモジュールの使用

コンポーネントは、必ずしも同じモジュール内にある必要はありません。モジュールは、定義を整理するのに役立つ論理的なスペースであり、他のモジュールの定義に依存できます。定義は遅延評価されるため、コンポーネントがそれを要求した場合にのみ解決されます。

別のモジュール内のリンクされたコンポーネントの例を見てみましょう。

```kotlin
// ComponentB <- ComponentA
class ComponentA()
class ComponentB(val componentA : ComponentA)

val moduleA = module {
    // シングルトン ComponentA
    single { ComponentA() }
}

val moduleB = module {
    // リンクされたインスタンス ComponentA を持つシングルトン ComponentB
    single { ComponentB(get()) }
}
```

:::info
Koin にはインポートの概念はありません。Koin の定義は遅延評価されます。Koin の定義は Koin コンテナで開始されますが、インスタンス化されません。インスタンスは、その型の要求が行われた場合にのみ作成されます。
:::

Koin コンテナを起動するときに、使用するモジュールのリストを宣言するだけです。

```kotlin
// moduleA と moduleB で Koin を起動
startKoin {
    modules(moduleA,moduleB)
}
```

これにより、Koin は指定されたすべてのモジュールから依存関係を解決します。

## 定義またはモジュールのオーバーライド (3.1.0 以降)

新しい Koin のオーバーライド戦略により、デフォルトで任意の定義をオーバーライドできます。モジュールで `override = true` を指定する必要はもうありません。

異なるモジュールに同じマッピングを持つ 2 つの定義がある場合、最後の定義が現在の定義をオーバーライドします。

```kotlin
val myModuleA = module {
    single<Service> { ServiceImp() }
}
val myModuleB = module {
    single<Service> { TestServiceImp() }
}

startKoin {
    // TestServiceImp は ServiceImp 定義をオーバーライドします
    modules(myModuleA,myModuleB)
}
```

Koin ログで、定義のマッピングのオーバーライドを確認できます。

`allowOverride(false)` を使用して、Koin アプリケーション構成でオーバーライドを許可しないように指定できます。

```kotlin
startKoin {
    // 定義のオーバーライドを禁止
    allowOverride(false)
}
```

オーバーライドを無効にした場合、Koin はオーバーライドを試みると `DefinitionOverrideException` 例外をスローします。

## モジュールの共有

`module { }` 関数を使用すると、Koin はすべてのインスタンスファクトリを事前割り当てします。モジュールを共有する必要がある場合は、関数でモジュールを返すことを検討してください。

```kotlin
fun sharedModule() = module {
    // 定義を記述 ...
}
```

これにより、定義が共有され、値にファクトリが事前割り当てされるのを防ぐことができます。

## 定義またはモジュールのオーバーライド (3.1.0 以前)

Koin では、既存の定義 (type、name、path など) を再定義することはできません。これを試みるとエラーが発生します。

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

val myModuleB = module {

    single<Service> { TestServiceImp() }
}

// BeanOverrideException がスローされます
startKoin {
    modules(myModuleA,myModuleB)
}
```

定義のオーバーライドを許可するには、`override` パラメータを使用する必要があります。

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

val myModuleB = module {

    // この定義をオーバーライド
    single<Service>(override=true) { TestServiceImp() }
}
```

```kotlin
val myModuleA = module {

    single<Service> { ServiceImp() }
}

// モジュールからのすべての定義のオーバーライドを許可
val myModuleB = module(override=true) {

    single<Service> { TestServiceImp() }
}
```

:::note
モジュールをリストし、定義をオーバーライドするときは、順序が重要です。オーバーライドする定義は、モジュールリストの最後に記述する必要があります。
:::

## モジュールリンク戦略

*モジュール間の定義は遅延評価されるため*、モジュールを使用してさまざまな戦略の実装を実装できます。モジュールごとに実装を宣言します。

リポジトリとデータソースの例を見てみましょう。リポジトリにはデータソースが必要であり、データソースはローカルまたはリモートの 2 つの方法で実装できます。

```kotlin
class Repository(val datasource : Datasource)
interface Datasource
class LocalDatasource() : Datasource
class RemoteDatasource() : Datasource
```

これらのコンポーネントは、3 つのモジュールで宣言できます。リポジトリとデータソースの実装ごとに 1 つずつです。

```kotlin
val repositoryModule = module {
    single { Repository(get()) }
}

val localDatasourceModule = module {
    single<Datasource> { LocalDatasource() }
}

val remoteDatasourceModule = module {
    single<Datasource> { RemoteDatasource() }
}
```

次に、モジュールの適切な組み合わせで Koin を起動するだけです。

```kotlin
// リポジトリ + ローカルデータソースの定義をロード
startKoin {
    modules(repositoryModule,localDatasourceModule)
}

// リポジトリ + リモートデータソースの定義をロード
startKoin {
    modules(repositoryModule,remoteDatasourceModule)
}
```

## モジュールインクルード (3.2 以降)

新しい関数 `includes()` が `Module` クラスで使用できるようになりました。これにより、他のモジュールを整理された構造化された方法で含めることによって、モジュールを構成できます。

この新機能の 2 つの主要なユースケースは次のとおりです。
- 大規模なモジュールを、より小さく、より焦点を絞ったモジュールに分割します。
- モジュール化されたプロジェクトでは、モジュールの可視性をより細かく制御できます (以下の例を参照)。

仕組みを見てみましょう。いくつかのモジュールを取得し、`parentModule` にモジュールを含めます。

```kotlin
// `:feature` モジュール
val childModule1 = module {
    /* その他の定義はこちら。 */
}
val childModule2 = module {
    /* その他の定義はこちら。 */
}
val parentModule = module {
    includes(childModule1, childModule2)
}

// `:app` モジュール
startKoin { modules(parentModule) }
```

すべてのモジュールを明示的に設定する必要はないことに注意してください。`parentModule` を含めることで、`includes` で宣言されたすべてのモジュールが自動的にロードされます (`childModule1` と `childModule2`)。言い換えれば、Koin は事実上 `parentModule`、`childModule1`、`childModule2` をロードしています。

注目すべき重要な詳細は、`includes` を使用して `internal` モジュールと `private` モジュールを追加できることです。これにより、モジュール化されたプロジェクトで公開するものを柔軟に制御できます。

:::info
モジュールのロードが最適化され、すべてのモジュールグラフがフラット化され、モジュールの定義の重複が回避されるようになりました。
:::

最後に、複数のネストされたモジュールまたは重複したモジュールを含めることができます。Koin は、重複を削除して、含まれているすべてのモジュールをフラット化します。

```kotlin
// :feature モジュール
val dataModule = module {
    /* その他の定義はこちら。 */
}
val domainModule = module {
    /* その他の定義はこちら。 */
}
val featureModule1 = module {
    includes(domainModule, dataModule)
}
val featureModule2 = module {
    includes(domainModule, dataModule)
}

// `:app` モジュール
startKoin { modules(featureModule1, featureModule2) }
```

すべてのモジュールは 1 回だけ含まれることに注意してください: `dataModule`、`domainModule`、`featureModule1`、`featureModule2`。

:::info
同じファイルからモジュールを含める際にコンパイルの問題が発生した場合は、モジュールで `get()` Kotlin 属性演算子を使用するか、各モジュールをファイルに分離してください。 https://github.com/InsertKoinIO/koin/issues/1341 の回避策を参照してください
:::
