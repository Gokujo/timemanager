import React from 'react';
import {Link} from 'react-router-dom';

const Impressum: React.FC = () => {
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

            <h1 className="text-3xl font-bold text-white mb-8">Impressum</h1>

            <div className="prose prose-invert max-w-none">
                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Angaben gemäß § 5 TMG</h2>
                    <div className="text-white/90 space-y-2">
                        <p><strong>Betreiber:</strong> Maxim Harder</p>
                        <p><strong>Anschrift:</strong> Bahnhofstr. 66, 47589 Uedem</p>
                        <p><strong>E-Mail:</strong> abuse@maharder.de</p>
                        <p><strong>Standort:</strong> Deutschland</p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                    <div className="text-white/90">
                        <p>Maxim Harder</p>
                        <p>Bahnhofstr. 66</p>
                        <p>47589 Uedem</p>
                        <p>Deutschland</p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Haftungsausschluss</h2>
                    <div className="text-white/90 space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-white mb-2">Haftung für Inhalte</h3>
                            <p>
                                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                                unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
                                Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-white mb-2">Haftung für Links</h3>
                            <p>
                                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                                Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
                                Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Urheberrecht</h2>
                    <div className="text-white/90">
                        <p>
                            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                            Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
                            Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Streitschlichtung</h2>
                    <div className="text-white/90">
                        <p>
                            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                            <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-300 hover:text-blue-200 underline">
                                https://ec.europa.eu/consumers/odr/
                            </a>
                        </p>
                        <p className="mt-2">
                            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                            Verbraucherschlichtungsstelle teilzunehmen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Impressum;
