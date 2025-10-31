import React from 'react';
import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom';
import './index.css';
import './styles/status.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import Nutzungsbedingungen from './pages/Nutzungsbedingungen';
import Benutzereinstellungen from './pages/Benutzereinstellungen';
import PopupPage from './pages/PopupPage';
import Changelog from './pages/Changelog';
import NotFoundPage from './components/NotFoundPage';

import HomePage from './components/HomePage';

const App: React.FC = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 md:p-6">
                <div className="max-w-4xl mx-auto glass-effect p-6">
                    <Header/>

                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/einstellungen" element={<Benutzereinstellungen/>}/>
                        <Route path="/impressum" element={<Impressum/>}/>
                        <Route path="/datenschutz" element={<Datenschutz/>}/>
                        <Route path="/nutzungsbedingungen" element={<Nutzungsbedingungen/>}/>
                        <Route path="/popup" element={<PopupPage/>}/>
                        <Route path="/changelog" element={<Changelog/>}/>
                        <Route path="*" element={<NotFoundPage/>}/>
                    </Routes>

                    <Footer />
                </div>
            </div>
        </Router>
    );
};

export default App;
