---
title: Koin Component
---
```markdown
Koin は、モジュールと定義を記述するための DSL であり、定義の解決を行うためのコンテナです。ここで必要なのは、コンテナの外部でインスタンスを取得するための API です。それが Koin コンポーネントの目的です。

:::info
`KoinComponent` インターフェースは、Koin から直接インスタンスを取得するのに役立ちます。ただし、これはクラスを Koin コンテナ API にリンクすることに注意してください。`modules` で宣言できるクラスで使用するのは避け、コンストラクタインジェクションを優先してください。
:::

## Koin コンポーネントの作成

クラスに Koin の機能を使用する機能を与えるには、`KoinComponent` インターフェースで *タグ付け* する必要があります。例を見てみましょう。

MyService インスタンスを定義するモジュール
```kotlin
class MyService

val myModule = module {
    // MyService のシングルトンを定義する
    single { MyService() }
}
```

定義を使用する前に Koin を起動します。

myModule で Koin を起動する

```kotlin
fun main(vararg args : String){
    // Koin を起動する
    startKoin {
        modules(myModule)
    }

    // MyComponent インスタンスを作成し、Koin コンテナから注入する
    MyComponent()
}
```

Koin コンテナからインスタンスを取得するために、`MyComponent` をどのように記述できるかを示します。

get() と by inject() を使用して MyService インスタンスを注入する

```kotlin
class MyComponent : KoinComponent {

    // Koin インスタンスを遅延注入する (lazy inject)
    val myService : MyService by inject()

    // または
    // Koin インスタンスを即時注入する (eager inject)
    val myService : MyService = get()
}
```

## KoinComponents で Koin API をアンロックする

クラスに `KoinComponent` としてタグを付けると、以下にアクセスできるようになります。

* `by inject()` - Koin コンテナからの遅延評価されたインスタンス (lazy evaluated instance)
* `get()` - Koin コンテナからインスタンスを即時フェッチ (eager fetch instance)
* `getProperty()`/`setProperty()` - プロパティの取得/設定

## get と inject で定義を取得する

Koin は、Koin コンテナからインスタンスを取得する 2 つの方法を提供します。

* `val t : T by inject()` - 遅延評価されたデリゲートインスタンス (lazy evaluated delegated instance)
* `val t : T = get()` - インスタンスへの即時アクセス (eager access)

```kotlin
// 遅延評価される (is lazy evaluated)
val myService : MyService by inject()

// インスタンスを直接取得する (retrieve directly the instance)
val myService : MyService = get()
```

:::note
遅延注入形式 (lazy inject form) は、遅延評価が必要なプロパティを定義するのに適しています。
:::

## 名前でインスタンスを解決する

必要に応じて、`get()` または `by inject()` で次のパラメータを指定できます。

* `qualifier` - 定義の名前 (定義で name パラメータを指定した場合)

定義名を使用するモジュールの例：

```kotlin
val module = module {
    single(named("A")) { ComponentA() }
    single(named("B")) { ComponentB(get()) }
}

class ComponentA
class ComponentB(val componentA: ComponentA)
```

次の解決を行うことができます。

```kotlin
// 指定されたモジュールから取得する (retrieve from given module)
val a = get<ComponentA>(named("A"))
```
```
