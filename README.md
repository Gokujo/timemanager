# ⚖️ DSGVO-konforme Arbeitszeiterfassung mit ArbZG-Compliance

Eine simple und moderne React-basierte Web-Anwendung zur exakten Erfassung von Arbeitszeiten mit vollständiger Einhaltung des deutschen Arbeitszeitschutzgesetzes (ArbZG) und DSGVO-Konformität.

![Deployment Status](https://github.com/Gokujo/timemanager/actions/workflows/deploy-ftp.yml/badge.svg)

## 🎯 Features

### ⚡ Echtzeit-Zeiterfassung

- Automatische Zeiterfassung mit Sekundenpräzision
- Manuelle Eingabe von Startzeiten möglich
- Real-Time Updates ohne Seitenaktualisierung
- DSGVO-konforme Browser-Speicherung (localStorage)

### 🛡️ ArbZG-Compliance

- **Automatische Arbeitszeit-Stoppung** bei maximalen Grenzen (10h/Tag)
- **Intelligente Pausenverwaltung**: 30min nach 6h, 45min nach 9h
- **Echtzeit-Pausen-Benachrichtigungen**: Automatische Anzeige "Pause bis XX:XX" mit blinkender Animation
- **Automatische Warnungen** bei ArbZG-Verstößen
- **Umgehungsoption** mit rechtlichen Hinweisen

### 📊 Übersichtliche Anzeige

- **Geleistete Arbeitszeit** mit Live-Updates
- **Voraussichtliches Arbeitsende** basierend auf geplanter Arbeitszeit
- **Verbleibende Zeit / Überstunden** automatisch berechnet
- Dynamische Farben im Popup (Orange/Grün/Rot je nach Status)
- Responsive Design für Desktop und Mobile

### 🌍 Deutsche Sprache

- Vollständig deutschsprachige Benutzeroberfläche
- Deutsche Zeit- und Datumsformate (DD.MM.YYYY, HH:MM)
- Deutsche Zahlenformate mit Komma als Dezimaltrennzeichen
- Alle Fehlermeldungen und Validierungen auf Deutsch

## 🚀 Technologie

- **Frontend**: React 19.1 + TypeScript
- **Styling**: Tailwind CSS + Material Tailwind
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

## 📋 Voraussetzungen

- Node.js 18.0 oder höher
- npm oder yarn

## 🔧 Installation

### 1. Aus Quellcode

#### 1. Repository klonen

```bash
git clone <repository-url>
cd arbeitszeiterfassung
```

#### 2. Dependencies installieren

```bash
npm install
```

### 2. Fertigbuild benutzen

#### 1. Release herunterladen

Den [letzten Release](https://github.com/Gokujo/timemanager/releases/latest) herunterladen

#### 2. Entpacken und nutzen

Den Release entpacken und auf eigenen Server / Hosting hochladen

## 🎮 Entwicklung

### Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist dann unter `http://localhost:3001` erreichbar.

### Build erstellen

```bash
npm run build
```

Der Build wird im `dist/` Ordner erstellt.

### Build-Vorschau

```bash
npm run preview
```

Vorschau des Builds unter `http://localhost:3001`. Oder unter `https://time.maharder.de`.

## 🚀 Deployment

Die Anwendung wird automatisch auf dem FTP-Server bereitgestellt, wenn Änderungen in den `main` Branch gemerged werden.

### Automatisches Deployment

- **Workflow**: GitHub Actions Deployment Pipeline
- **Trigger**: Automatisch bei Push/merge zu `main`
- **Build**: Vite Production Build
- **Deployment**: FTP-Upload zu konfiguriertem Server

### Versionsnummern

Jedes Deployment erhält eine eindeutige Versionsnummer im Format:

```
major.minor.patch-build-NNN
```

Beispiel: `0.2.0-build-123`

- **Semantische Version**: Aus `package.json`
- **Build-Nummer**: GitHub Actions Run Number

### GitHub Secrets Konfiguration

Die folgenden Secrets müssen im Repository konfiguriert werden:

| Secret Name  | Beschreibung                | Beispiel          |
| ------------ | --------------------------- | ----------------- |
| FTP_USER     | FTP-Benutzername            | `myuser`          |
| FTP_PASSWORD | FTP-Passwort                | `mypassword123`   |
| FTP_SERVER   | FTP-Server Hostname oder IP | `ftp.example.com` |

**Konfiguration**: Repository Settings → Secrets and variables → Actions → New repository secret

### Dateien-Erhaltung

Während des Deployments werden folgende Dateien/Ordner automatisch erhalten:

- `.well-known/` Ordner
- `.htaccess` Datei

Alle anderen Dateien werden vor dem Upload gelöscht (Clean Slate Deployment).

### Deployment-Status

Den aktuellen Deployment-Status können Sie in der GitHub Actions Registerkarte einsehen.

## 🧪 Tests

```bash
npm test
```

### Testabdeckung

```bash
npm test -- --coverage
```

Testabdeckungsbericht wird im `coverage/` Ordner generiert.

## 📁 Projektstruktur

```
src/
├── components/       # React-Komponenten
├── constants/        # Konstanten und Konfiguration
├── hooks/           # Custom React Hooks
├── interfaces/      # TypeScript-Interfaces
├── pages/           # Seitenkomponenten
├── styles/          # CSS-Dateien
└── utils/           # Utility-Funktionen
```

## 🔒 DSGVO-Konformität

- Alle Daten werden **nur lokal** im Browser gespeichert (localStorage)
- **Keine Server-Kommunikation** - alle Berechnungen erfolgen client-seitig
- **Keine Weitergabe** von Daten an Dritte
- Benutzer haben vollständige Kontrolle über ihre Daten

## 📝 ArbZG-Compliance

Die Anwendung respektiert alle Bestimmungen des deutschen Arbeitszeitschutzgesetzes:

- **Maximale Arbeitszeit**: 10 Stunden pro Tag
- **Mindestpause**: 30 Minuten nach 6 Stunden Arbeit
- **Erweiterte Pause**: 45 Minuten nach 9 Stunden Arbeit
- **Anwesenheitszeit**: Konfigurierbare Grenzen pro Arbeitsplan

## 🐛 Bekannte Probleme

Derzeit keine bekannten kritischen Probleme.

## 🤝 Beitragen

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request mit einer detaillierten Beschreibung Ihrer Änderungen.

## 📄 Lizenz

Siehe [LICENSE](LICENSE) Datei für weitere Informationen.

## 👤 Autor

Entwickelt für die Arbeitszeiterfassung nach deutschem Recht.

## 📞 Support

Bei Fragen oder Problemen öffnen Sie bitte ein Issue auf GitHub.

---

**Wichtiger rechtlicher Hinweis**: Diese Anwendung dient ausschließlich zur Dokumentation der Arbeitszeiten. Die rechtlichen Verpflichtungen des Arbeitgebers gegenüber dem ArbZG bestehen unabhängig von der Verwendung dieser Software.
