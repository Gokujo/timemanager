import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Arbeitszeiterfassung</h1>
      <p className="text-sm text-gray-200">Konform mit deutschem Arbeitszeitgesetz (ArbZG)</p>
    </header>
  );
};

export default Header;