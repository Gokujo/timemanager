import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import './styles/status.css';

// Components
import Header from './components/Header';

// Pages
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import Nutzungsbedingungen from './pages/Nutzungsbedingungen';

import HomePage from './components/HomePage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 md:p-6">
        <div className="max-w-4xl mx-auto glass-effect p-6">
          <Header />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/nutzungsbedingungen" element={<Nutzungsbedingungen />} />
          </Routes>
          
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link 
                to="/impressum" 
                className="text-white/70 hover:text-white transition-colors"
              >
                Impressum
              </Link>
              <span className="text-white/50">•</span>
              <Link 
                to="/datenschutz" 
                className="text-white/70 hover:text-white transition-colors"
              >
                Datenschutz
              </Link>
              <span className="text-white/50">•</span>
              <Link 
                to="/nutzungsbedingungen" 
                className="text-white/70 hover:text-white transition-colors"
              >
                Nutzungsbedingungen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
