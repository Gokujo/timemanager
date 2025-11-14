# Pull Request: Release v{VERSION}

## 📋 Zusammenfassung

<!--
Bitte füllen Sie die folgenden Felder aus.
Die Version wird automatisch aus dem Branch-Namen extrahiert (releases/vX.Y.Z).
Falls Sie die Vorgängerversion nicht kennen, lassen Sie das Feld leer - es wird automatisch gefunden.
-->

**Version:** `v{VERSION}` <!-- Automatisch aus Branch-Namen: releases/vX.Y.Z -->
**Vorgängerversion:** `v{PREVIOUS_VERSION}` <!-- Wird automatisch gefunden -->
**Release-Datum:** {DATE} <!-- Format: YYYY-MM-DD -->

## 🔄 Änderungen gegenüber v{PREVIOUS_VERSION}

<!-- Die folgenden Abschnitte werden automatisch aus CHANGELOG.md extrahiert -->
<!-- Bitte überprüfen Sie die automatisch generierten Änderungen und passen Sie sie bei Bedarf an -->

### ✨ Neu hinzugefügt

<!-- Neue Features, Funktionen oder Komponenten -->

-

### 🔧 Geändert

<!-- Änderungen an bestehenden Features -->

-

### 🐛 Behoben

<!-- Bugfixes und Korrekturen -->

-

### 🗑️ Entfernt

<!-- Entfernte Features oder Funktionen -->

-

### 🔒 Security

<!-- Sicherheitsrelevante Änderungen -->

-

### 📚 Technical

<!-- Technische Verbesserungen, Refactorings, Performance-Optimierungen -->

-

## 📝 Changelog-Eintrag

<!-- Bitte kopieren Sie den relevanten Abschnitt aus CHANGELOG.md hier ein -->

```markdown
## [VERSION] - YYYY-MM-DD

### Fixed

- ...

### Changed

- ...

### Added

- ...
```

## ✅ Checkliste

- [ ] Changelog wurde aktualisiert (`CHANGELOG.md`)
- [ ] Version wurde in `package.json` aktualisiert
- [ ] Version wurde in `src/components/Footer.tsx` aktualisiert
- [ ] Version wurde in `src/pages/Changelog.tsx` aktualisiert (nur GUI-Änderungen)
- [ ] Alle Tests bestehen
- [ ] Code wurde auf Linter-Fehler überprüft
- [ ] Dokumentation wurde bei Bedarf aktualisiert
- [ ] Breaking Changes sind dokumentiert (falls vorhanden)

## 🔍 Automatische Änderungsanalyse

<!-- Die folgenden Abschnitte werden automatisch durch GitHub Actions generiert -->

### 📊 Geänderte Dateien

<!-- Wird automatisch durch GitHub Actions gefüllt -->

### 📈 Statistik

<!-- Wird automatisch durch GitHub Actions gefüllt -->

- **Geänderte Dateien:** {FILE_COUNT}
- **Hinzugefügte Zeilen:** {ADDITIONS}
- **Entfernte Zeilen:** {DELETIONS}

### 🔗 Vergleich mit Vorgängerversion

```bash
# Vergleich mit Vorgängerversion
git diff releases/v{PREVIOUS_VERSION}..releases/v{VERSION}
```

## 🧪 Testing

<!-- Beschreiben Sie, wie die Änderungen getestet wurden -->

- [ ] Manuelle Tests durchgeführt
- [ ] Automatische Tests hinzugefügt/aktualisiert
- [ ] Edge Cases getestet
- [ ] Browser-Kompatibilität geprüft

## 📸 Screenshots (falls zutreffend)

<!-- Fügen Sie Screenshots hinzu, wenn UI-Änderungen vorgenommen wurden -->

## 🔗 Verwandte Issues

<!-- Verlinken Sie zugehörige Issues -->

Closes #{ISSUE_NUMBER}

## 📌 Notizen

<!-- Zusätzliche Informationen oder Hinweise für Reviewer -->

---

**Hinweis:** Dieser Pull Request erstellt automatisch einen Release-Branch `releases/v{VERSION}` und ein GitHub Release, wenn er in `main` gemergt wird.
