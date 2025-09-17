import React from 'react';
import {Link} from 'react-router-dom';

const Nutzungsbedingungen: React.FC = () => {
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

            <h1 className="text-3xl font-bold text-white mb-8">Nutzungsbedingungen</h1>

            <div className="prose prose-invert max-w-none">
                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">§ 1 Geltungsbereich</h2>
                    <div className="text-white/90">
                        <p>
                            Diese Nutzungsbedingungen gelten für die Nutzung der Arbeitszeiterfassungsanwendung
                            (nachfolgend "Anwendung"). Mit der Nutzung der Anwendung erkennen Sie diese
                            Nutzungsbedingungen als verbindlich an.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">§ 2 Leistungsbeschreibung</h2>
                    <div className="text-white/90 space-y-4">
                        <p>
                            Die Anwendung bietet eine webbasierte Lösung zur Erfassung und Verwaltung von Arbeitszeiten
                            unter Einhaltung deutscher Arbeitszeitgesetze (ArbZG).
                        </p>

                        <h3 className="text-lg font-medium text-white">Funktionen:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Erfassung von Arbeitszeiten und Pausenzeiten</li>
                            <li>Automatische Validierung nach ArbZG</li>
                            <li>Lokale Datenspeicherung</li>
                            <li>Verschiedene Anwesenheitspläne</li>
                            <li>Berechnung von Überstunden und verbleibender Arbeitszeit</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">§ 3 Nutzungsrecht</h2>
                    <div className="text-white/90 space-y-4">
                        <p>
                            Die Anwendung wird kostenlos zur Verfügung gestellt. Der Nutzer erhält ein einfaches,
                            nicht ausschließliches, nicht übertragbares Recht zur Nutzung der Anwendung.
                        </p>

                        <h3 className="text-lg font-medium text-white">Erlaubte Nutzung:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Private und gewerbliche Nutzung</li>
                            <li>Erfassung eigener Arbeitszeiten</li>
                            <li>Lokale Datenspeicherung</li>
                        </ul>

                        <h3 className="text-lg font-medium text-white">Verbotene Nutzung:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Reverse Engineering oder Dekompilierung</li>
                            <li>Weitergabe an Dritte ohne Erlaubnis</li>
                            <li>Kommerzielle Weiterentwicklung</li>
                            <li>Missbräuchliche Nutzung der Anwendung</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">§ 4 Haftungsausschluss</h2>
                    <div className="text-white/90 space-y-4">
                        <h3 className="text-lg font-medium text-white">Allgemeine Haftung</h3>
                        <p>
                            Die Anwendung wird "wie besehen" zur Verfügung gestellt. Es wird keine Gewähr für
                            die Vollständigkeit, Richtigkeit oder Verfügbarkeit der Anwendung übernommen.
                        </p>

                        <h3 className="text-lg font-medium text-white">Datensicherheit</h3>
                        <p>
                            Der Nutzer ist selbst für die Sicherung seiner Daten verantwortlich. Es wird keine
                            Haftung für Datenverluste übernommen.
                        </p>

                        <h3 className="text-lg font-medium text-white">Rechtliche Compliance</h3>
                        <p>
                            Obwohl die Anwendung nach deutschen Arbeitszeitgesetzen validiert, liegt die
                            Verantwortung für die Einhaltung aller rechtlichen Vorschriften beim Nutzer.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">§ 5 Datenschutz</h2>
                    <div className="text-white/90">
                        <p>
                            Die Anwendung speichert alle Daten ausschließlich lokal auf dem Gerät des Nutzers.
                            Es erfolgt keine Übertragung von Daten an externe Server. Weitere Informationen
                            finden Sie in unserer Datenschutzerklärung.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">§ 6 Änderungen</h2>
                    <div className="text-white/90">
                        <p>
                            Der Anbieter behält sich das Recht vor, diese Nutzungsbedingungen jederzeit zu
                            ändern. Änderungen werden dem Nutzer über die Anwendung mitgeteilt. Die
                            fortgesetzte Nutzung nach Änderungen gilt als Zustimmung zu den neuen Bedingungen.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">§ 7 Schlussbestimmungen</h2>
                    <div className="text-white/90 space-y-4">
                        <h3 className="text-lg font-medium text-white">Anbieter</h3>
                        <div className="p-3 bg-white/5 rounded border border-white/20">
                            <p><strong>Maxim Harder</strong></p>
                            <p>Bahnhofstr. 66</p>
                            <p>47589 Uedem</p>
                            <p>E-Mail: abuse@maharder.de</p>
                        </div>

                        <h3 className="text-lg font-medium text-white">Anwendbares Recht</h3>
                        <p>
                            Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
                        </p>

                        <h3 className="text-lg font-medium text-white">Gerichtsstand</h3>
                        <p>
                            Gerichtsstand ist der Sitz des Anbieters (Uedem), sofern der Nutzer Kaufmann,
                            juristische Person des öffentlichen Rechts oder öffentlich-rechtliches
                            Sondervermögen ist.
                        </p>

                        <h3 className="text-lg font-medium text-white">Salvatorische Klausel</h3>
                        <p>
                            Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein oder werden,
                            bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nutzungsbedingungen;
