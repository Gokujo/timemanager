import React, { useMemo, useState } from 'react';

type ChangelogSection = {
  title: string;
  items: string[];
};

type VersionEntry = {
  version: string;
  date: string;
  sections: ChangelogSection[];
};

const Changelog: React.FC = () => {
  const versions = useMemo<VersionEntry[]>(
    () => [
      {
        version: 'v0.2.4',
        date: '31.10.2025',
        sections: [
          {
            title: 'Neu',
            items: [
              'GitHub Repository-Link im Footer hinzugefügt - direkt zum Quellcode.'
            ]
          },
          { 
            title: 'Geändert', 
            items: []
          },
          { 
            title: 'Behoben', 
            items: [
              'Version im Footer korrekt angezeigt.',
              'Changelog zeigt jetzt alle Versionen vollständig an.'
            ]
          }
        ]
      },
      {
        version: 'v0.2.3',
        date: '28.10.2025',
        sections: [
          {
            title: 'Neu',
            items: [
              'Echtzeit-Pausen-Benachrichtigung: Anzeige wechselt automatisch zu "Pause bis XX:XX" wenn Pausenzeit eintrifft.',
              'Blinkende Animation für aktive Pausen zur visuellen Aufmerksamkeit.',
              'Intelligente Pausenzeiten-Berechnung: Nur tatsächlich stattfindende Pausen werden von der Arbeitszeit abgezogen.'
            ]
          },
          { 
            title: 'Geändert', 
            items: [
              'Arbeitszeitberechnung berücksichtigt jetzt nur aktive Pausen.',
              '"Vorauss. Arbeitsende" bleibt von Pausenstatus unberührt und zeigt korrekte Zeit.'
            ]
          },
          { 
            title: 'Behoben', 
            items: [
              'Zeitanzeige ist jetzt korrekt über DST-Übergänge hinweg (Winter-/Sommerzeit).',
              'Bug behoben: Falsche Zeitberechnung (z.B. 23m statt 67min bei 1h 7min Arbeitszeit).'
            ]
          }
        ]
      },
      {
        version: 'v0.2.2',
        date: '17.10.2025',
        sections: [
          {
            title: 'Neu',
            items: [
              '8-Stunden-Standardarbeitszeit für alle Werktage als Standardwert eingeführt.',
              'Footer-Navigation mit direktem Link zur Startseite hinzugefügt.',
              '404-Fehlerseite für ungültige URLs.',
              'Automatische Arbeitszeit-Stoppung bei maximalen Grenzen (ArbZG-konform).',
              'Umgehungsoption für maximale Arbeitszeit mit rechtlichen Warnungen.',
              'Verbesserte Fehlermeldungen auf Deutsch.'
            ]
          },
          { 
            title: 'Geändert', 
            items: [
              'Deutsche Sprachkonsistenz durchgängig sichergestellt.',
              'Verbesserte Navigation zwischen Seiten.',
              'Footer mit Startseite-Link und besseren Accessibility-Features.',
              'Direkte URL-Zugriffe funktionieren jetzt ohne Fehler.'
            ]
          },
          { 
            title: 'Behoben', 
            items: [
              'Deutsche Singular-/Plural-Formen in Zeitformatierung korrigiert.',
              '404-Fehler bei direktem Aufruf von URLs behoben.',
              'Navigation zwischen Seiten ohne Verlust der Arbeitszeit-Daten.',
              'Automatische Stoppung respektiert jetzt ArbZG-Grenzen korrekt.',
              'Schnellere Ladezeiten und bessere Performance.'
            ]
          }
        ]
      },
      {
        version: 'v0.2.1',
        date: '17.09.2025',
        sections: [
          {
            title: 'Neu',
            items: [
              'SEO-Optimierung für bessere Suchmaschinen-Auffindbarkeit hinzugefügt.',
              'Dynamische Hintergrundfarben im Popup basierend auf Arbeitsfortschritt.',
              'Changelog mit Datumsangaben erweitert.'
            ]
          },
          { 
            title: 'Geändert', 
            items: [
              'Popup lädt alle Parameter aus localStorage statt URL-Parametern.',
              'Hintergrundfarben: Orange für Arbeitszeit, Grün für Überstunden, Rot bei Überschreitung.',
              'Text-Shadow für bessere Lesbarkeit auf hellen Hintergründen hinzugefügt.'
            ]
          },
          { 
            title: 'Behoben', 
            items: [
              'Pausenzeitenberechnung in der geleisteten Arbeitszeit korrigiert.',
              'Break-Zeiten werden jetzt korrekt von der Arbeitszeit abgezogen.'
            ]
          }
        ]
      },
      {
        version: 'v0.2.0',
        date: '15.09.2025',
        sections: [
          {
            title: 'Neu',
            items: [
              'Changelog-Seite mit zusammenklappbaren Versionseinträgen (Accordion).',
              'Footer-Version verlinkt zur Changelog-Seite.',
              'Benutzereinstellungen sind hinzugefügt worden.',
              'Rechtlich relevante Seiten wurden hinzugefügt.'
            ]
          },
          { title: 'Geändert', items: [] },
          { 
            title: 'Behoben', 
            items: [
              'Popup-Anzeige wurde behoben.',
              'Pausenzeitenberechnung wurde behoben.'
            ]
          }
        ]
      },
      {
        version: 'v0.1.0',
        date: '04.06.2025',
        sections: [
          {
            title: 'Neu',
            items: ['Initiale Version mit einfacher Berechnung und Darstellung.']
          },
          { title: 'Geändert', items: [] },
          { title: 'Behoben', items: [] }
        ]
      }
    ],
    []
  );

  // Latest version expanded by default (index 0)
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Changelog</h1>

      <div className="rounded-xl bg-white/5 ring-1 ring-white/10 divide-y divide-white/10">
        {versions.map((entry, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={entry.version} className="">
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="w-full flex justify-between items-center py-4 px-4 md:px-6 text-white/90 hover:text-white"
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg font-semibold">{entry.version}</span>
                  <span className="text-sm text-white/60">{entry.date}</span>
                </div>
                <span className="transition-transform duration-300 text-white/80">
                  {isOpen ? (
                    // minus icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
                      <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                    </svg>
                  ) : (
                    // plus icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
                      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                className={
                  'overflow-hidden transition-all duration-300 ease-in-out px-4 md:px-6 ' +
                  (isOpen ? 'max-h-[1000px] pb-5' : 'max-h-0')
                }
              >
                <div className="space-y-4 text-white/80">
                  {entry.sections.map(section => (
                    <div key={section.title}>
                      <h2 className="font-medium text-white">{section.title}</h2>
                      {section.items.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {section.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-white/60">Keine Einträge.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Changelog;


