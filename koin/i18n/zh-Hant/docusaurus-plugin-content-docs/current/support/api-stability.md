---
title: "API 穩定性 & 發佈類型"
custom_edit_url: null
---
## API 穩定性

Koin 專案致力於在各版本之間保持高度的相容性。Kotzilla 團隊和所有積極的維護者努力確保新版本中引入的任何變更、增強或最佳化都不會破壞現有的應用程式。
我們深知，穩定且可預測的升級路徑對我們的使用者至關重要，因此我們努力在發展 API 時最大限度地減少中斷。

### 實驗性 API - @KoinExperimentalAPI
為了在收集寶貴的社群回饋的同時促進創新，我們在 `@KoinExperimentalAPI` 註解下引入了新的功能和 API。此標示表示：

- **積極開發中**：API 仍處於設計階段，可能會發生變更。
- **鼓勵回饋**：我們邀請開發人員測試這些功能並分享他們的經驗，以幫助我們完善和改進設計。
- **潛在的重大變更**：由於這些 API 是實驗性的，因此可能會在後續版本中根據社群的意見進行修改或刪除。

### 棄用策略 - @Deprecated

為了確保在逐步淘汰 API 的某些部分時能夠平穩過渡，Koin 使用 `@Deprecated` 註解來清楚地標記這些區域。我們的棄用策略包括：

明確的警告：已棄用的 API 附帶一條訊息，指示建議的替代方案或棄用的原因。

棄用級別：
- **Warning (警告)**：表示雖然 API 仍然可用，但不鼓勵使用，應儘早替換。
- **Error (錯誤)**：表示 API 不再用於使用，並且不會編譯，從而確保及時解決重要的變更。

這種方法可幫助開發人員識別和更新依賴於過時 API 的程式碼，從而減少技術債務，並為更簡潔、更健壯的程式碼庫鋪平道路。
`ReplaceWith` 可以與 API 一起提供，具體取決於更新的複雜性。

### 內部 API - @KoinInternalAPI

對於嚴格用於 Koin 框架內部的功能，我們引入了 `@KoinInternalAPI` 註解。這些 API 不是公共合約的一部分，並且：

- **僅供內部使用**：專為 Koin 的內部機制而設計。
- **可能會發生變更**：可能會在未事先通知的情況下進行修改或在未來的版本中刪除。
- **避免外部使用**：不鼓勵開發人員在其應用程式程式碼中使用這些 API，以保持長期相容性。

### 使用 Kotlin 的 @OptIn 註解選擇加入

Koin 中實驗性和已棄用 API 的使用都需要選擇加入 (opt-in)，從而確保開發人員充分了解 API 的狀態和潛在風險。
透過使用 Kotlin 的 `@OptIn` 註解，您可以明確聲明您的程式碼依賴於實驗性或標記為已棄用的 API。

## 發佈類型

Koin 遵循語義版本控制 (Semantic Versioning, SemVer)，並帶有額外的首碼識別符，用於指示每個版本的成熟度和預期用途。我們使用的首碼包括：

- **Release Candidate (RC - 候選版本)**：這些版本是穩定版本的完整功能候選版本。它們經過最終測試和完善。雖然 RC 版本旨在具有高度相容性，但根據官方版本之前的最終回饋，可能仍會發生細微變更。
- **Alpha / Beta**: Alpha 和 Beta 版本主要用於測試和回饋。它們通常包含實驗性功能，可能不完全符合穩定的 API 保證。鼓勵開發人員在非生產環境中嘗試這些版本，以幫助識別潛在問題並指導未來的改進。