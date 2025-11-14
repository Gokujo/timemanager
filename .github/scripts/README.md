# GitHub Scripts

Dieses Verzeichnis enthält Hilfsskripte für die Arbeit mit Releases und Pull Requests.

## Scripts

### `prepare-pr.sh`

Bereitet eine PR-Beschreibung mit Changelog-Informationen vor.

**Verwendung:**
```bash
# Automatisch (Version wird aus Branch-Namen extrahiert)
./.github/scripts/prepare-pr.sh

# Manuell mit Versionen
./.github/scripts/prepare-pr.sh 0.2.6 0.2.5
```

**Funktionen:**
- Extrahiert Version aus Branch-Namen (`releases/vX.Y.Z`)
- Findet automatisch die Vorgängerversion aus Git-Branches oder CHANGELOG.md
- Extrahiert Changelog-Eintrag für die aktuelle Version
- Erstellt eine PR-Beschreibung basierend auf dem Template

**Ausgabe:**
Die PR-Beschreibung wird nach `/tmp/pr_description.md` geschrieben und kann in die GitHub PR-Beschreibung kopiert werden.

### `extract-changelog.sh`

Extrahiert einen Changelog-Eintrag für eine bestimmte Version.

**Verwendung:**
```bash
./.github/scripts/extract-changelog.sh 0.2.6 0.2.5
```

**Funktionen:**
- Extrahiert den Changelog-Eintrag für die angegebene Version aus `CHANGELOG.md`
- Gibt den Eintrag auf stdout aus

## GitHub Actions Workflows

### `pr-changelog.yml`

Automatischer Workflow, der bei jedem PR auf `main` ausgeführt wird, wenn der Branch mit `releases/v` beginnt.

**Funktionen:**
- Extrahiert automatisch Version und Vorgängerversion
- Erstellt einen PR-Kommentar mit Changelog-Informationen
- Zeigt Statistik über geänderte Dateien
- Aktualisiert den Kommentar bei neuen Commits

## Pull Request Template

Das Template unter `.github/pull_request_template.md` wird automatisch verwendet, wenn ein neuer PR erstellt wird.

**Platzhalter:**
- `{VERSION}` - Wird durch die aktuelle Version ersetzt
- `{PREVIOUS_VERSION}` - Wird durch die Vorgängerversion ersetzt
- `{DATE}` - Wird durch das aktuelle Datum ersetzt

Die Platzhalter werden automatisch durch GitHub Actions oder das `prepare-pr.sh` Script ersetzt.

