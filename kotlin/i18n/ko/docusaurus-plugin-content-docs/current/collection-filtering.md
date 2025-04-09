---
title: "컬렉션 필터링"
---
필터링은 컬렉션 처리에서 가장 많이 사용되는 작업 중 하나입니다.
Kotlin에서 필터링 조건은 _predicate_ (컬렉션 요소를 가져와 부울 값을 반환하는 람다 함수)로 정의됩니다. `true`는 주어진 요소가 predicate와 일치함을 의미하고 `false`는 그 반대를 의미합니다.

표준 라이브러리에는 한 번의 호출로 컬렉션을 필터링할 수 있는 확장 함수 그룹이 포함되어 있습니다.
이러한 함수는 원래 컬렉션을 변경하지 않으므로 [mutable 및 read-only](collections-overview#collection-types) 컬렉션 모두에 사용할 수 있습니다. 필터링 결과를 사용하려면 변수에 할당하거나 필터링 후 함수를 연결해야 합니다.

## Predicate로 필터링

기본 필터링 함수는 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)입니다.
`filter()`는 predicate와 함께 호출될 때 일치하는 컬렉션 요소를 반환합니다.
`List`와 `Set`의 경우 결과 컬렉션은 `List`이고, `Map`의 경우 `Map`입니다.

```kotlin
fun main() {

    val numbers = listOf("one", "two", "three", "four")  
    val longerThan3 = numbers.filter { it.length > 3 }
    println(longerThan3)

    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredMap = numbersMap.filter { (key, value) `->` key.endsWith("1") && value > 10}
    println(filteredMap)

}
```

`filter()`의 predicate는 요소의 값만 확인할 수 있습니다.
필터에서 요소 위치를 사용하려면 [`filterIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-indexed.html)를 사용하세요.
이 함수는 인덱스와 요소 값의 두 가지 인수를 가진 predicate를 사용합니다.

부정 조건으로 컬렉션을 필터링하려면 [`filterNot()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not.html)을 사용하세요.
이 함수는 predicate가 `false`를 생성하는 요소 목록을 반환합니다.

```kotlin
fun main() {

    val numbers = listOf("one", "two", "three", "four")
    
    val filteredIdx = numbers.filterIndexed { index, s `->` (index != 0) && (s.length < 5)  }
    val filteredNot = numbers.filterNot { it.length <= 3 }

    println(filteredIdx)
    println(filteredNot)

}
```

지정된 유형의 요소를 필터링하여 요소 유형을 좁히는 함수도 있습니다.

* [`filterIsInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html)는 지정된 유형의 컬렉션 요소를 반환합니다.
    `List<Any>`에서 호출되는 `filterIsInstance<T>()`는 `List<T>`를 반환하므로 해당 항목에서 `T` 유형의 함수를 호출할 수 있습니다.

    ```kotlin
    fun main() {

        val numbers = listOf(null, 1, "two", 3.0, "four")
        println("All String elements in upper case:")
        numbers.filterIsInstance<String>().forEach {
            println(it.uppercase())
        }

    }
    ```
    

* [`filterNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not-null.html)은 모든 null이 아닌 요소를 반환합니다.
    `List<T?>`에서 호출되는 `filterNotNull()`은 `List<T: Any>`를 반환하므로 요소를 null이 불가능한 객체로 처리할 수 있습니다.

    ```kotlin
    fun main() {

        val numbers = listOf(null, "one", "two", null)
        numbers.filterNotNull().forEach {
            println(it.length)   // length is unavailable for nullable Strings
        }

    }
    ```
    

## Partition

또 다른 필터링 함수인 [`partition()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/partition.html)은 predicate로 컬렉션을 필터링하고 일치하지 않는 요소를 별도의 목록에 보관합니다.
따라서 `List`의 `Pair`를 반환 값으로 사용합니다. 첫 번째 목록에는 predicate와 일치하는 요소가 포함되고 두 번째 목록에는 원래 컬렉션의 나머지 모든 요소가 포함됩니다.

```kotlin
fun main() {

    val numbers = listOf("one", "two", "three", "four")
    val (match, rest) = numbers.partition { it.length > 3 }

    println(match)
    println(rest)

}
```

## Predicate 테스트

마지막으로 컬렉션 요소에 대해 predicate를 간단히 테스트하는 함수가 있습니다.

* [`any()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/any.html)는 하나 이상의 요소가 주어진 predicate와 일치하면 `true`를 반환합니다.
* [`none()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/none.html)는 요소가 predicate와 일치하지 않으면 `true`를 반환합니다.
* [`all()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/all.html)는 모든 요소가 주어진 predicate와 일치하면 `true`를 반환합니다.
    `all()`은 비어 있는 컬렉션에서 유효한 predicate와 함께 호출될 때 `true`를 반환합니다. 이러한 동작은 논리에서 _[vacuous truth](https://en.wikipedia.org/wiki/Vacuous_truth)_로 알려져 있습니다.

```kotlin
fun main() {

    val numbers = listOf("one", "two", "three", "four")

    println(numbers.any { it.endsWith("e") })
    println(numbers.none { it.endsWith("a") })
    println(numbers.all { it.endsWith("e") })

    println(emptyList<Int>().all { it > 5 })   // vacuous truth

}
```

`any()` 및 `none()`은 predicate 없이도 사용할 수 있습니다. 이 경우 컬렉션이 비어 있는지 확인하기만 합니다.
`any()`는 요소가 있으면 `true`를 반환하고 없으면 `false`를 반환합니다. `none()`은 그 반대를 수행합니다.

```kotlin
fun main() {

    val numbers = listOf("one", "two", "three", "four")
    val empty = emptyList<String>()

    println(numbers.any())
    println(empty.any())
    
    println(numbers.none())
    println(empty.none())

}
```