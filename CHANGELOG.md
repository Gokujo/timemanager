# Changelog

Alle bedeutsamen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Footer-Navigation mit direktem Link zur Startzeit hinzugefügt
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
- Footer-Komponente mit Startzeit-Link und Accessibility-Features
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
