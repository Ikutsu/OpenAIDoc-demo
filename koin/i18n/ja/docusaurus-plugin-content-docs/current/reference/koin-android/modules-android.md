---
title: Multiple Koin Modules in Android
---
Koin を使用すると、モジュール内で定義を記述できます。このセクションでは、モジュールの宣言、編成、およびリンクの方法について説明します。

## 複数のモジュールの使用

コンポーネントは必ずしも同じモジュール内にある必要はありません。モジュールは、定義を整理するのに役立つ論理的な空間であり、別のモジュールの定義に依存できます。定義は遅延評価され (lazy)、コンポーネントが要求したときにのみ解決されます。

別のモジュール内のリンクされたコンポーネントの例を見てみましょう。

```kotlin
// ComponentB <- ComponentA
class ComponentA()
class ComponentB(val componentA : ComponentA)

val moduleA = module {
    // Singleton ComponentA
    single { ComponentA() }
}

val moduleB = module {
    // Singleton ComponentB with linked instance ComponentA
    single { ComponentB(get()) }
}
```

Koin コンテナを開始するときに、使用するモジュールのリストを宣言するだけです。

```kotlin
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // ...

            // Load modules
            modules(moduleA, moduleB)
        }
        
    }
}
```

Gradle モジュールごとに自分で編成し、複数の Koin モジュールを収集するのはあなた次第です。

> 詳しくは[Koin Modules Section](/docs/reference/koin-core/modules)をご覧ください。

## Module Includes (3.2 以降)

`Module` クラスで新しい関数 `includes()` が利用できるようになり、他のモジュールを体系的かつ構造化された方法で含めることによってモジュールを構成できます。

この新機能の主なユースケースは次の 2 つです。
- 大きなモジュールをより小さく、より焦点を絞ったモジュールに分割します。
- モジュール化されたプロジェクトでは、モジュールの可視性をより細かく制御できます (以下の例を参照)。

仕組みを見てみましょう。いくつかのモジュールを用意し、`parentModule` にモジュールを含めます。

```kotlin
// `:feature` module
val childModule1 = module {
    /* Other definitions here. */
}
val childModule2 = module {
    /* Other definitions here. */
}
val parentModule = module {
    includes(childModule1, childModule2)
}

// `:app` module
startKoin { modules(parentModule) }
```

すべてのモジュールを明示的に設定する必要はありません。`parentModule` を含めることで、`includes` で宣言されたすべてのモジュールが自動的にロードされます (`childModule1` および `childModule2`)。言い換えれば、Koin は事実上 `parentModule`、`childModule1`、および `childModule2` をロードしています。

注意すべき重要な点は、`includes` を使用して `internal` および `private` モジュールも追加できることです。これにより、モジュール化されたプロジェクトで公開するものを柔軟に制御できます。

:::info
モジュールのロードが最適化され、すべてのモジュールグラフがフラット化され、モジュールの重複した定義が回避されるようになりました。
:::

最後に、複数のネストされたモジュールまたは重複したモジュールを含めることができ、Koin はすべての含まれるモジュールをフラット化して、重複を削除します。

```kotlin
// :feature module
val dataModule = module {
    /* Other definitions here. */
}
val domainModule = module {
    /* Other definitions here. */
}
val featureModule1 = module {
    includes(domainModule, dataModule)
}
val featureModule2 = module {
    includes(domainModule, dataModule)
}
```

```kotlin
// `:app` module
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            // ...

            // Load modules
             modules(featureModule1, featureModule2)
        }
        
    }
}
```

すべてのモジュールは 1 回だけ含まれることに注意してください: `dataModule`、`domainModule`、`featureModule1`、`featureModule2`。

## バックグラウンドモジュールローディングによる起動時間の短縮

リソースの事前割り当てをトリガーせず、Koin の起動時にバックグラウンドでロードすることを避けるために、「遅延 (lazy)」Koin モジュールを宣言できるようになりました。これにより、遅延モジュールをバックグラウンドでロードするために渡すことで、Android の起動プロセスがブロックされるのを回避できます。

- `lazyModule` - Koin Module の遅延 Kotlin バージョンを宣言します
- `Module.includes` - 遅延モジュールのインクルードを許可します
- `KoinApplication.lazyModules` - プラットフォームのデフォルトの `Dispatchers` に関して、コルーチンを使用してバックグラウンドで遅延モジュールをロードします
- `Koin.waitAllStartJobs` - 開始ジョブの完了を待ちます
- `Koin.runOnKoinStarted` - 開始完了後にブロックコードを実行します

理解を深めるには、常に良い例が役立ちます。

```kotlin

// Lazy loaded module
val m2 = lazyModule {
    singleOf(::ClassB)
}

val m1 = module {
    singleOf(::ClassA) { bind<IClassA>() }
}

startKoin {
    // sync module loading
    modules(m1)
    // load lazy Modules in background
    lazyModules(m2)
}

val koin = KoinPlatform.getKoin()

// wait for start completion
koin.waitAllStartJobs()

// or run code after start
koin.runOnKoinStarted { koin ->
    // run after background load complete
}
```
