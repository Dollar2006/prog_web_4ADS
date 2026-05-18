import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './styles/App.css';
import Continents from './pages/Continents';
import Countries from './pages/Countries';





// Outras páginas (placeholders)
const Home = () => <div className="page-content"><h1>🌍 Bem-vindo ao Mundo App</h1><p>Explore dados globais.</p></div>;
const Cidades = () => <div className="page-content"><h1>🏙️ Cidades</h1><p>Página de cidades.</p></div>;
const Noticias = () => <div className="page-content"><h1>📰 Notícias</h1><p>Página de notícias.</p></div>;

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/continentes" element={<Continents />} />
            <Route path="/paises" element={<Countries />} />
            <Route path="/cidades" element={<Cidades />} />
            <Route path="/noticias" element={<Noticias />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
