---
title: Verifying your Koin configuration
---
Koinを使用すると、構成モジュールを検証して、実行時に依存性注入の問題を発見することを回避できます。

## Verify()によるKoin構成チェック - JVMのみ [3.3]

Koin Moduleでverify()拡張関数を使用します。それだけです！内部的には、これはすべてのコンストラクタークラスを検証し、Koin構成と相互チェックして、この依存関係に対してコンポーネントが宣言されているかどうかを確認します。失敗した場合、関数はMissingKoinDefinitionExceptionをスローします。

```kotlin
val niaAppModule = module {
    includes(
        jankStatsKoinModule,
        dataKoinModule,
        syncWorkerKoinModule,
        topicKoinModule,
        authorKoinModule,
        interestsKoinModule,
        settingsKoinModule,
        bookMarksKoinModule,
        forYouKoinModule
    )
    viewModelOf(::MainActivityViewModel)
}
```

```kotlin
class NiaAppModuleCheck {

    @Test
    fun checkKoinModule() {

        // Koin構成を検証します
        niaAppModule.verify()
    }
}
```

JUnitテストを起動すれば完了です！✅

ご覧のとおり、Koin構成で使用されているが、直接宣言されていない型をリストするために、追加のTypesパラメーターを使用します。 これは、注入されたパラメーターとして使用されるSavedStateHandle型とWorkerParameters型の場合です。 Contextは、開始時にandroidContext()関数によって宣言されます。

verify() APIは非常に軽量で、構成で実行するためにモック/スタブを必要としません。

## 注入されたパラメーターによる検証 - JVMのみ [4.0]

`parametersOf`を使用して注入されたオブジェクトを暗示する構成がある場合、構成にパラメーターの型の定義がないため、検証は失敗します。
ただし、特定の定義`definition<Type>(Class1::class, Class2::class ...)`で注入されるパラメーター型を定義できます。

方法は次のとおりです。

```kotlin
class ModuleCheck {

    // 注入された定義を持つ定義が与えられた場合
    val module = module {
        single { (a: Simple.ComponentA) -> Simple.ComponentB(a) }
    }

    @Test
    fun checkKoinModule() {
        
        // 注入されたパラメーターを検証および宣言する
        module.verify(
            injections = injectedParameters(
                definition<Simple.ComponentB>(Simple.ComponentA::class)
            )
        )
    }
}
```

## タイプのホワイトリスト登録

タイプを「ホワイトリスト」として追加できます。 これは、このタイプが任意の定義に対してシステムに存在すると見なされることを意味します。 方法は次のとおりです。

```kotlin
class NiaAppModuleCheck {

    @Test
    fun checkKoinModule() {

        // Koin構成を検証します
        niaAppModule.verify(
            // 定義で使用されているが、直接宣言されていないタイプをリストします（パラメーターの注入など）
            extraTypes = listOf(MyType::class ...)
        )
    }
}
```
