---
title: Scopes
---
Koinは、ライフタイムが制限されたインスタンスを定義するためのシンプルなAPIを提供します。

## スコープとは？

スコープ（Scope）とは、オブジェクトが存在する一定期間またはメソッド呼び出しのことです。
別の見方をすると、スコープはオブジェクトの状態が持続する時間と考えることができます。
スコープコンテキストが終了すると、そのスコープにバインドされたオブジェクトは再び注入できなくなります（コンテナから削除されます）。

## スコープの定義

Koinでは、デフォルトで3種類のスコープがあります。

- `single` 定義：コンテナのライフタイム全体で永続化されるオブジェクトを作成します（削除できません）。
- `factory` 定義：毎回新しいオブジェクトを作成します。短寿命です。コンテナに永続化されません（共有できません）。
- `scoped` 定義：関連するスコープのライフタイムに関連付けられたオブジェクトを作成します。

スコープ付きの定義を宣言するには、次のように `scoped` 関数を使用します。スコープは、スコープ付きの定義を時間の論理単位として収集します。

特定の型に対してスコープを宣言するには、`scope` キーワードを使用する必要があります。

```kotlin
module {
    scope<MyType>{
        scoped { Presenter() }
        // ...
    }
}
```

### スコープIDとスコープ名

Koinのスコープは、以下によって定義されます。

- スコープ名 - スコープのクォリファイア
- スコープID - スコープインスタンスの一意の識別子

:::note
 `scope<A> { }` は `scope(named<A>()){ } ` と同等ですが、より簡単に記述できます。文字列クォリファイア `scope(named("SCOPE_NAME")) { }` も使用できます。
:::

`Koin` インスタンスから、以下にアクセスできます。

- `createScope(id : ScopeID, scopeName : Qualifier)` - 指定されたIDとスコープ名でクローズされたスコープインスタンスを作成します。
- `getScope(id : ScopeID)` - 指定されたIDで以前に作成されたスコープを取得します。
- `getOrCreateScope(id : ScopeID, scopeName : Qualifier)` - 指定されたIDとスコープ名で、クローズされたスコープインスタンスを作成するか、すでに作成されている場合は取得します。

:::note
 デフォルトでは、オブジェクトで `createScope` を呼び出しても、スコープの「ソース」は渡されません。パラメーターとして渡す必要があります：`T.createScope(<source>)`
:::

### スコープコンポーネント：コンポーネントにスコープを関連付ける [2.2.0]

Koinには、スコープインスタンスをそのクラスに提供するのに役立つ `KoinScopeComponent` の概念があります。

```kotlin
class A : KoinScopeComponent {
    override val scope: Scope by lazy { createScope(this) }
}

class B
```

`KoinScopeComponent` インターフェースは、いくつかの拡張機能を提供します。
- 現在のコンポーネントのスコープIDと名前からスコープを作成する `createScope`
- スコープからインスタンスを解決する `get`、`inject`（`scope.get()` および `scope.inject()` と同等）

Aのスコープを定義して、Bを解決してみましょう。

```kotlin
module {
    scope<A> {
        scoped { B() } // Aのスコープに関連付けられています
    }
}
```

`org.koin.core.scope` `get` および `inject` 拡張機能のおかげで、`B`のインスタンスを直接解決できます。

```kotlin
class A : KoinScopeComponent {
    override val scope: Scope by lazy { newScope(this) }

    // Bをinjectとして解決します
    val b : B by inject() // スコープからinject

    // Bを解決します
    fun doSomething(){
        val b = get<B>()
    }

    fun close(){
        scope.close() // 現在のスコープを閉じることを忘れないでください
    }
}
```

### スコープ内の依存関係の解決

スコープの `get` および `inject` 関数を使用して依存関係を解決するには：`val presenter = scope.get<Presenter>()` 

スコープの利点は、スコープ付きの定義に対して共通の論理単位の時間を定義することです。また、特定のスコープ内から定義を解決することもできます。

```kotlin
// クラスが与えられた場合
class ComponentA
class ComponentB(val a : ComponentA)

// スコープを持つモジュール
module {
    
    scope<A> {
        scoped { ComponentA() }
        // 現在のスコープインスタンスから解決されます
        scoped { ComponentB(get()) }
    }
}
```

依存関係の解決は簡単です。

```kotlin
// スコープを作成します
val myScope = koin.createScope<A>()

// 同じスコープから
val componentA = myScope.get<ComponentA>()
val componentB = myScope.get<ComponentB>()
```

:::info
 デフォルトでは、現在のスコープで定義が見つからない場合、すべてのスコープはメインスコープにフォールバックして解決します
:::

### スコープを閉じる

スコープインスタンスが終了したら、`close()` 関数で閉じるだけです。

```kotlin
// KoinComponentから
val scope = getKoin().createScope<A>()

// それを使用します ...

// それを閉じます
scope.close()
```

:::info
 閉じられたスコープからインスタンスを注入できなくなることに注意してください。
:::

### スコープのソース値の取得

Koin Scope API 2.1.4では、定義でスコープの元のソースを渡すことができます。以下の例を見てみましょう。
シングルトンインスタンス `A` があるとします。

```kotlin
class A
class BofA(val a : A)

module {
    single { A() }
    scope<A> {
        scoped { BofA(getSource() /* or even get() */) }

    }
}
```

Aのスコープを作成することにより、スコープのソース（Aインスタンス）の参照を、スコープの基礎となる定義に転送できます：`scoped { BofA(getSource()) }` または `scoped { BofA(get()) }`

これは、カスケードパラメーターインジェクションを回避し、スコープ付きの定義でソース値を直接取得するためです。

```kotlin
val a = koin.get<A>()
val b = a.scope.get<BofA>()
assertTrue(b.a == a)
```

:::note
 `getSource()` と `get()` の違い：getSourceはソース値を直接取得します。Getは定義を解決しようとし、可能であればソース値にフォールバックします。したがって、`getSource()` はパフォーマンスの点でより効率的です。
:::

### スコープのリンク

Koin Scope API 2.1では、スコープを別のスコープにリンクして、結合された定義空間を解決することができます。例を見てみましょう。
ここでは、2つのスコープ空間、AのスコープとBのスコープを定義しています。Aのスコープでは、C（Bのスコープで定義されている）にアクセスできません。

```kotlin
module {
    single { A() }
    scope<A> {
        scoped { B() }
    }
    scope<B> {
        scoped { C() }
    }
}
```

スコープリンクAPIを使用すると、BのスコープインスタンスCをAのスコープから直接解決できます。このために、スコープインスタンスで `linkTo()` を使用します。

```kotlin
val a = koin.get<A>()
// AのスコープからBを取得しましょう
val b = a.scope.get<B>()
// AのスコープをBのスコープにリンクしましょう
a.scope.linkTo(b.scope)
// AまたはBのスコープから同じCインスタンスを取得しました
assertTrue(a.scope.get<C>() == b.scope.get<C>())
```
