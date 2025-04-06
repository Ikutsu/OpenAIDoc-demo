---
title: Koin Embedded
custom_edit_url: null
---
```markdown
Koin Embedded는 Android/Kotlin SDK & 라이브러리 개발자를 대상으로 하는 새로운 Koin 프로젝트입니다.

이 프로젝트는 다른 패키지 이름으로 Koin 프로젝트를 재빌드하고 패키징하는 데 도움이 되는 스크립트를 제안합니다. 이는 SDK 및 라이브러리 개발에 유용하며, 임베디드된 Koin 버전과 충돌할 수 있는 다른 버전의 Koin을 사용하는 모든 소비 애플리케이션 간의 충돌을 방지하기 위함입니다.

피드백이나 도움이 필요하신가요? [Koin Team](mailto:koin@kotzilla.io)에 문의하십시오.

## Embedded Version (임베디드 버전)

다음은 Koin 임베디드 버전의 예입니다: [Kotzilla Repository](https://repository.kotzilla.io/#browse/browse:Koin-Embedded)
- 사용 가능한 패키지: `embedded-koin-core`, `embedded-koin-android`
- `org.koin.*`에서 `embedded.koin.*`로 재배치 (Relocation)

다음 Maven 저장소로 Gradle 구성을 설정하십시오:
```kotlin
maven { 'https://repository.kotzilla.io/repository/kotzilla-platform/' }
```

## Relocation Scripts (재배치 스크립트)

다음은 특정 패키지 이름으로 Koin을 재빌드하여 임베드하고 Koin 프레임워크의 일반적인 사용과의 충돌을 피하는 데 도움이 되는 스크립트입니다.

자세한 내용은 Koin [relocation scripts](https://github.com/InsertKoinIO/koin-embedded?tab=readme-ov-file#koin-relocation-scripts) 프로젝트를 참조하십시오.
    ```
    