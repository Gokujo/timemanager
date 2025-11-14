# Changelog

Alle bedeutsamen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.6] - 2025-11-14

### Fixed

- **Verbleibende Zeit während Pause**: "Verbleibende Zeit" wird jetzt korrekt eingefroren, wenn eine aktive Pause erkannt wird (konsistent mit geleisteter Arbeitszeit)
- **Sekundenzähler**: Sekundenzähler aktualisiert sich jetzt korrekt jede Sekunde (war zuvor bei 0 Sekunden eingefroren)
- **Überstunden-Anzeige**: Überstunden werden jetzt korrekt berechnet und aktualisiert, auch mit Sekunden-Präzision
- **Arbeitsbeginn-Änderung**: Wenn der "Tatsächlicher Arbeitsbeginn" geändert wird, wird die geleistete Arbeitszeit sofort neu berechnet und angezeigt
- **Pausenberechnung**: Pausen, die vor dem Arbeitsbeginn starten, aber danach enden, werden jetzt korrekt behandelt (nur der überlappende Teil wird abgezogen)
- **Pausen-Datumsnormalisierung**: Pausen-Daten werden jetzt automatisch auf das Datum des Arbeitsbeginns normalisiert, um korrekte Berechnungen zu gewährleisten
- **Endlosschleifen behoben**: Mehrere "Maximum update depth exceeded" Fehler behoben durch:
  - Verwendung funktionaler State-Updates in `useTimeTracking` Hook
  - Entfernung von `validateAndSetWarnings` Callback-Dependencies
  - Optimierung der `useEffect` Dependencies
  - Prüfung auf tatsächliche Änderungen vor State-Updates

### Changed

- `TimeDisplay` Komponente: Verbleibende Zeit-Berechnung verwendet jetzt `calculationTime` (eingefroren bei aktiver Pause) statt `now`
- `calculateWorkedTime` Funktion: Pausen-Overlap-Berechnung verbessert für Pausen, die vor Arbeitsbeginn starten
- `useTimeTracking` Hook: `ensureRequiredBreaks` verwendet jetzt funktionales State-Update, um Endlosschleifen zu vermeiden
- `useTimeTracking` Hook: Validierung wird jetzt direkt in `useEffect` durchgeführt statt über Callback
- Meta-Tag aktualisiert: `mobile-web-app-capable` hinzugefügt (neuer Standard), `apple-mobile-web-app-capable` bleibt für Rückwärtskompatibilität

### Technical

- Verbesserte Fehlerbehandlung: Graceful degradation bei Pausenerkennungsfehlern
- Performance-Optimierung: Reduzierte unnötige Re-Renders durch State-Update-Prüfungen
- Code-Stabilität: Eliminierung von React Hooks Endlosschleifen

## [0.2.5] - 2025-11-05

### Added

- Apache `.htaccess` Konfiguration für SPA-Routing in Produktion hinzugefügt
- Vite Development Server `historyApiFallback` Konfiguration für direkte URL-Zugriffe im Entwicklungsmodus
- Überlappungs-Validierung für Pausen hinzugefügt (`validateBreakOverlap` in `src/utils/validationUtils.ts`)
- Erweiterte `getActiveBreak` Funktion: Wählt längste Pause bei mehreren aktiven Pausen
- Integrationstests für Pausenzeit-Berechnung hinzugefügt (`tests/integration/pauseTimeCalculation.test.tsx`)
- Unit Tests für Break-Utilities hinzugefügt (`tests/unit/breakUtils.test.ts`)
- Unit Tests für Validation-Utilities hinzugefügt (`tests/unit/validationUtils.test.ts`)
- Unit Tests für Time-Utilities erweitert (`tests/unit/timeUtils.test.ts`)
- **Aktionsknöpfe bei aktiver Pause**: Button-States schalten automatisch um, wenn eine geplante Pause aktiv wird
- Unit Tests für Controls-Komponente hinzugefügt (`tests/unit/controls.test.tsx`)
- Unit Tests für useTimeTracking Hook erweitert (`tests/unit/useTimeTracking.test.ts`)
- Integrationstests für Active Break Controls hinzugefügt (`tests/integration/activeBreakControls.test.tsx`)

### Fixed

- 404-Fehler bei direktem Aufruf von URLs behoben (z.B. `/datenschutz`, `/impressum`, `/einstellungen`)
- Alle Routen sind jetzt via direkter URL-Zugriff erreichbar (SPA-Routing)
- Server-Side Routing-Konfiguration für Apache-Server implementiert
- Development Server unterstützt jetzt History API Fallback für Client-Side Routing
- **Korrekte Pausenzeit-Berechnung**: Geplante Pausen (duration-only) werden nicht mehr im Voraus von der geleisteten Arbeitszeit abgezogen
- **Arbeitszeit-Anzeige**: Geleistete Arbeitszeit zeigt sofort > 0 nach Start, auch mit geplanten Pausen
- **Pausenzeit-Einfrieren**: Arbeitszeit wird während aktiver Pausen korrekt eingefroren
- **Nur abgeschlossene Pausen**: Nur abgeschlossene Pausen (mit start/end) werden von der geleisteten Arbeitszeit abgezogen
- **Überlappende Pausen**: System verhindert präventiv, dass mehrere Pausen zur gleichen Zeit geplant werden können
- **Mehrere aktive Pausen**: Bei mehreren aktiven Pausen wird die längste Pause verwendet
- **Aktionsknöpfe bei aktiver Pause**: "Pause"-Button wird ausgeblendet und "Fortsetzen"-Button wird aktiv, wenn eine geplante Pause aktiv wird
- **Status-Indikator bei aktiver Pause**: Status-Indikator zeigt "Pausiert" (gelb), auch wenn der Status 'running' bleibt
- **Resume-Handler für geplante Pausen**: Resume-Handler prüft zuerst auf aktive geplante Pause und beendet diese, bevor normale Resume-Logik verwendet wird

### Changed

- `calculateWorkedTime` Funktion in `src/utils/timeUtils.ts`: Entfernt Subtraktion von geplanten Pausen (duration-only)
- `getActiveBreak` Funktion in `src/utils/breakUtils.ts`: Erweitert um Logik zur Auswahl der längsten aktiven Pause
- `TimeDisplay` Komponente: Entfernt Subtraktion von geplanten Pausen (duration-only)
- `useTimeTracking` Hook: Integriert Überlappungs-Validierung in `onAddBreak`, `onUpdateBreakStart`, und `onUpdateBreakEnd`
- `Controls` Komponente: Erweitert um `breaks` und `startTime` Props, Button-States basieren jetzt auf aktiver Pause
- `Controls` Komponente: Pause-Button wird ausgeblendet, Resume-Button wird aktiv, wenn eine geplante Pause aktiv ist
- `Controls` Komponente: Status-Indikator zeigt "Pausiert" (gelb), wenn eine geplante Pause aktiv ist, auch wenn Status 'running' bleibt
- `useTimeTracking` Hook: Resume-Handler erweitert um Logik zur Erkennung und Beendigung aktiver geplanter Pausen
- `HomePage` Komponente: Übergibt `breaks` und `startTime` Props an Controls-Komponente

## [0.2.4] - 2025-10-31

### Added

- GitHub Actions Workflow für automatisches FTP-Deployment hinzugefügt (.github/workflows/deploy-ftp.yml)
- Automatische Deployment-Pipeline: Build und Upload bei jedem Merge in main Branch
- Version-Generierung mit semantischer Versionierung + Build-Nummer
- Telegram-Benachrichtigungen für erfolgreiche und fehlgeschlagene Deployments
- GitHub Repository-Link im Footer hinzugefügt
- Automatische Deployment-Dokumentation im README hinzugefügt
- Concurrency-Control für Deployment-Workflows (cancelt in-progress deployments)
- Datei-Erhaltung während Deployment (.well-known und .htaccess bleiben erhalten)
- Deployment-Status-Badge im README

### Changed

- Footer-Komponente verwendet jetzt die zentrale Footer-Komponente statt Inline-Code
- Version im Footer und Changelog synchronisiert
- App.tsx verwendet jetzt Footer-Komponente aus components/

### Fixed

- Version im Footer korrekt auf v0.2.4 aktualisiert
- Changelog enthält jetzt alle Versionen inklusive v0.2.2

## [0.2.3] - 2025-10-28

### Added

- Echtzeit-Pausen-Benachrichtigung: Anzeige wechselt automatisch zu "Pause bis XX:XX" wenn Pausenzeit eintrifft
- Blinkende Animation für aktive Pausen zur visuellen Aufmerksamkeit
- Intelligente Pausenzeiten-Berechnung: Nur tatsächlich stattfindende Pausen werden von der Arbeitszeit abgezogen
- Zukünftige Pausen werden in der Anzeige angezeigt, aber nicht vorzeitig berechnet
- Neue Break-Status-Erkennung (getActiveBreak, getDisplayMode) implementiert
- calculateWorkedTime erweitert mit activeBreak-Parameter
- CSS-Animationen für Pausen-Benachrichtigung mit 60fps
- Unit-Tests für Break-Detection-Logik hinzugefügt

### Changed

- Arbeitszeitberechnung berücksichtigt jetzt nur aktive Pausen
- "Vorauss. Arbeitsende" bleibt von Pausenstatus unberührt und zeigt korrekte Zeit

### Fixed

- Kritischer DST (Daylight Saving Time) Bug in Zeitberechnungen behoben
- Zeitberechnung verwendet jetzt korrekten Date-Konstruktor statt setHours() Methode
- Zeitanzeige ist jetzt korrekt über DST-Übergänge hinweg (Winter-/Sommerzeit)
- Startzeit und Pausenzeiten werden jetzt korrekt über alle Zeitzonen-Änderungen hinweg berechnet
- Bug behoben: Falsche Zeitberechnung (z.B. 23m statt 67min bei 1h 7min Arbeitszeit)

### Security

- Support für prefers-reduced-motion für bessere Zugänglichkeit

## [0.2.2] - 2025-10-17

### Added

- Umfassende Code-Restrukturierung nach Clean Code Prinzipien implementiert
- 8-Stunden-Standardarbeitszeit für alle Werktage als Standardwert eingeführt
- Umfangreiches Test-Framework mit Jest und React Testing Library eingerichtet
- Performance-Monitoring und Bundle-Size-Optimierung implementiert
- Gemeinsame Utility-Funktionen für Zeitberechnungen und Validierung erstellt
- Umfassende Fehlerbehandlung mit deutschen Fehlermeldungen hinzugefügt
- Footer-Navigation mit direktem Link zur Startseite hinzugefügt
- 404-Fehlerseite (NotFoundPage) für ungültige URLs implementiert
- Automatische Arbeitszeit-Stoppung bei maximalen Grenzen (ArbZG-konform)
- Umgehungsoption für maximale Arbeitszeit mit rechtlichen Warnungen
- React Router DOM für Client-Side Routing integriert
- AutoStopManager-Komponente für automatische Zeitüberwachung
- OverrideToggle-Komponente für Umgehungsoptionen
- Umfassende Timer-Management und Cleanup-Utilities
- DSGVO-konforme localStorage-Verwaltung für Override-Einstellungen
- Edge-Case-Behandlung für Seitenaktualisierung und Multi-Tab-Szenarien

### Changed

- Deutsche Sprachkonsistenz durchgängig sichergestellt
- Alle Utility-Funktionen nach DRY-Prinzip refaktoriert
- Zeitberechnungslogik in wiederverwendbare Funktionen extrahiert
- Validierungslogik in kleinere, fokussierte Funktionen aufgeteilt
- Variablennamen zu aussagekräftigen Namen (≥ 3 Zeichen) geändert
- Funktionen auf maximale Länge von 50 Zeilen begrenzt
- Zyklomatische Komplexität auf ≤ 10 pro Funktion reduziert
- Deutsche Zeit- und Zahlenformate durchgängig implementiert
- Arbeitszeitschutzgesetz-Validierung optimiert und konsolidiert
- App.tsx mit React Router DOM BrowserRouter konfiguriert
- HomePage mit AutoStopManager und OverrideToggle erweitert
- Footer-Komponente mit Startseite-Link und Accessibility-Features
- Routing-System für direkte URL-Zugriffe ohne 404-Fehler
- ArbZG-Compliance-Validierung für 10h max Arbeitszeit implementiert
- Pausenregelungen (30min nach 6h, 45min nach 9h) automatisch überwacht
- Deutsche Benachrichtigungen und Warnungen für Auto-Stop-Events
- Timer-basierte Überwachung mit konfigurierbaren Intervallen

### Fixed

- Code-Duplikation in Zeitberechnungsfunktionen eliminiert
- Deutsche Singular-/Plural-Formen in Zeitformatierung korrigiert
- Edge-Cases in Formatierungsfunktionen behoben
- Performance-Probleme durch optimierte Utility-Funktionen gelöst
- Bundle-Größe auf 79.95 kB gzipped optimiert (< 500KB Ziel)
- Ladezeit auf 1.89s verbessert (< 2s Ziel)
- Speicherverbrauch auf < 50MB begrenzt
- Echtzeit-Updates auf < 100ms optimiert
- 404-Fehler bei direktem Aufruf von URLs wie /changelog behoben
- Navigation zwischen Seiten ohne Verlust der Arbeitszeit-Daten
- Automatische Stoppung respektiert jetzt ArbZG-Grenzen korrekt
- Umgehungsoption funktioniert nur während aktiver Arbeitszeit (nicht in Pausen)
- Speicher-Leaks durch ordnungsgemäße Timer-Cleanup verhindert
- Multi-Tab-Synchronisation für Override-Einstellungen implementiert
- Mitternacht-Zeitgrenze-Edge-Case in Auto-Stop-Logik behoben
- Performance-Optimierung durch intelligente Timer-Intervalle

### Removed

- Unverwendete Importe und Code-Duplikate

## [0.2.1] - 2025-09-17

### Added

- SEO-Optimierung für bessere Suchmaschinen-Auffindbarkeit hinzugefügt
- Dynamische Hintergrundfarben im Popup basierend auf Arbeitsfortschritt
- Changelog mit Datumsangaben erweitert

### Changed

- Popup lädt alle Parameter aus localStorage statt URL-Parametern
- Hintergrundfarben: Orange für Arbeitszeit, Grün für Überstunden, Rot bei Überschreitung
- Text-Shadow für bessere Lesbarkeit auf hellen Hintergründen hinzugefügt

### Fixed

- Pausenzeitenberechnung in der geleisteten Arbeitszeit korrigiert
- Break-Zeiten werden jetzt korrekt von der Arbeitszeit abgezogen

## [0.2.0] - 2025-09-15

### Added

- Changelog-Seite mit zusammenklappbaren Versionseinträgen (Accordion)
- Footer-Version verlinkt zur Changelog-Seite
- Benutzereinstellungen sind hinzugefügt worden
- Rechtlich relevante Seiten wurden hinzugefügt

### Changed

- Popup-Anzeige wurde überarbeitet

### Fixed

- Popup-Anzeige wurde behoben
- Pausenzeitenberechnung wurde behoben

## [0.1.0] - 2025-06-04

### Added

- Initiale Version mit einfacher Berechnung und Darstellung
