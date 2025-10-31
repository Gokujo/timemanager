import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
        Arbeitszeiterfassung Online - Kostenloser Timetracker
      </h1>
      <p className="text-sm text-white/80 mb-2">
        Professionelle Zeiterfassung für Arbeitszeit, Pausenzeiten und Überstunden
      </p>
      <p className="text-xs text-white/60">
        Konform mit deutschem Arbeitszeitgesetz (ArbZG) • Keine Anmeldung erforderlich
      </p>
    </header>
  );
};

export default Header;