import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Globe } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Modal from './components/modal';
import Table from './components/table';
import type { Column } from './components/table';
import './styles/App.css';

// Interface para o Continente
interface ContinenteData {
  id: number;
  nome: string;
  paisesCount: number;
  cidadesCount: number;
}

const Continentes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock de dados baseado na sua imagem
  const mockContinentes: ContinenteData[] = [
    { id: 1, nome: 'América do Sul', paisesCount: 4, cidadesCount: 5 },
    { id: 2, nome: 'Europa', paisesCount: 4, cidadesCount: 4 },
    { id: 3, nome: 'Ásia', paisesCount: 3, cidadesCount: 2 },
    { id: 4, nome: 'América do Norte', paisesCount: 3, cidadesCount: 5 },
    { id: 5, nome: 'África', paisesCount: 2, cidadesCount: 2 },
    { id: 6, nome: 'Oceania', paisesCount: 2, cidadesCount: 2 },
  ];

  // Configuração das Colunas
  const columns: Column<ContinenteData>[] = [
    { 
      header: 'Continente', 
      key: 'nome',
      render: (item) => (
        <div className="cell-with-icon">
          <div className="cell-icon-wrapper">
            <Globe size={18} />
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome}</span>
        </div>
      )
    },
    { 
      header: 'Países', 
      key: 'paisesCount',
      render: (item) => <span className="cell-number-green">{item.paisesCount}</span>
    },
    { 
      header: 'Cidades', 
      key: 'cidadesCount',
      render: (item) => <span className="cell-number-purple">{item.cidadesCount}</span>
    }
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1>🗺️ Continentes</h1>
          <p>Gerencie os continentes e veja o resumo de ocupação.</p>
        </div>
        <button className="btn-save" onClick={() => setIsModalOpen(true)}>
          + Novo Continente
        </button>
      </div>

      <Table 
        columns={columns} 
        data={mockContinentes}
        totalItems={mockContinentes.length}
        itemsPerPage={6}
        onEdit={(item) => console.log('Editando', item)}
        onDelete={(item) => console.log('Deletando', item)}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Novo Continente"
        footer={
          <>
            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn-save" onClick={() => setIsModalOpen(false)}>Salvar</button>
          </>
        }
      >
        <div className="form-group">
          <label htmlFor="nome">Nome do Continente</label>
          <input type="text" id="nome" placeholder="Ex: América do Sul" autoFocus />
        </div>
      </Modal>
    </div>
  );
};

// Outras páginas (placeholders)
const Home = () => <div className="page-content"><h1>🌍 Bem-vindo ao Mundo App</h1><p>Explore dados globais.</p></div>;
const Paises = () => <div className="page-content"><h1>🏳️ Países</h1><p>Página de países.</p></div>;
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
            <Route path="/continentes" element={<Continentes />} />
            <Route path="/paises" element={<Paises />} />
            <Route path="/cidades" element={<Cidades />} />
            <Route path="/noticias" element={<Noticias />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
