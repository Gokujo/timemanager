import React from 'react';
import {Link} from 'react-router-dom';

const Datenschutz: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto glass-effect p-6">
            <div className="mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
                >
                    <span>←</span> Zurück zur Arbeitszeiterfassung
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-white mb-8">Datenschutzerklärung</h1>

            <div className="prose prose-invert max-w-none">
                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">1. Datenschutz auf einen Blick</h2>
                    <div className="text-white/90 space-y-4">
                        <h3 className="text-lg font-medium text-white">Allgemeine Hinweise</h3>
                        <p>
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                            passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                            persönlich identifiziert werden können.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">2. Datenerfassung auf dieser Website</h2>
                    <div className="text-white/90 space-y-4">
                        <h3 className="text-lg font-medium text-white">Wer ist verantwortlich für die Datenerfassung?</h3>
                        <p>
                            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:
                        </p>
                        <div className="mt-2 p-3 bg-white/5 rounded border border-white/20">
                            <p><strong>Maxim Harder</strong></p>
                            <p>Bahnhofstr. 66</p>
                            <p>47589 Uedem</p>
                            <p>E-Mail: abuse@maharder.de</p>
                        </div>

                        <h3 className="text-lg font-medium text-white">Wie erfassen wir Ihre Daten?</h3>
                        <p>
                            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um
                            Daten handeln, die Sie in ein Kontaktformular eingeben.
                        </p>
                        <p>
                            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
                            IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder
                            Uhrzeit des Seitenaufrufs).
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">3. Lokale Datenspeicherung</h2>
                    <div className="text-white/90 space-y-4">
                        <h3 className="text-lg font-medium text-white">LocalStorage und Cookies</h3>
                        <p>
                            Diese Anwendung speichert Ihre Arbeitszeiterfassungsdaten ausschließlich lokal auf Ihrem Gerät
                            in LocalStorage und Cookies. Es werden keine Daten an externe Server übertragen.
                        </p>

                        <h3 className="text-lg font-medium text-white">Gespeicherte Daten</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Arbeitszeiten und Pausenzeiten</li>
                            <li>Einstellungen (Anwesenheitsplan, geplante Arbeitszeit)</li>
                            <li>Status der Zeiterfassung (gestoppt, laufend, pausiert)</li>
                            <li>Warnungen und Validierungen</li>
                        </ul>

                        <h3 className="text-lg font-medium text-white">Zweck der Speicherung</h3>
                        <p>
                            Die lokale Speicherung dient ausschließlich der Funktionalität der Arbeitszeiterfassung und
                            ermöglicht es Ihnen, Ihre Daten zwischen Browsersitzungen zu behalten.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">4. Ihre Rechte</h2>
                    <div className="text-white/90 space-y-4">
                        <h3 className="text-lg font-medium text-white">Recht auf Auskunft</h3>
                        <p>
                            Sie haben das Recht, jederzeit Auskunft über die von uns verarbeiteten personenbezogenen Daten
                            zu verlangen.
                        </p>

                        <h3 className="text-lg font-medium text-white">Recht auf Löschung</h3>
                        <p>
                            Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen. Sie können
                            jederzeit alle lokal gespeicherten Daten über den "Alle Daten löschen" Button in der Anwendung
                            entfernen.
                        </p>

                        <h3 className="text-lg font-medium text-white">Recht auf Datenübertragbarkeit</h3>
                        <p>
                            Sie haben das Recht, die Sie betreffenden personenbezogenen Daten, die Sie uns bereitgestellt haben,
                            in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">5. Datensicherheit</h2>
                    <div className="text-white/90">
                        <p>
                            Wir verwenden innerhalb des Besuchs unserer Website das verbreitete SSL-Verfahren in Verbindung
                            mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird.
                        </p>
                        <p className="mt-2">
                            Die lokale Datenspeicherung erfolgt verschlüsselt und ist nur für Sie auf Ihrem Gerät zugänglich.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">6. Änderungen dieser Datenschutzerklärung</h2>
                    <div className="text-white/90">
                        <p>
                            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
                            rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der
                            Datenschutzerklärung umzusetzen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Datenschutz;
