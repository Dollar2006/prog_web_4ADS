import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Globe, Map, Building2, Newspaper } from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Continentes', icon: Globe, path: '/continentes' },
    { name: 'Países', icon: Map, path: '/paises' },
    { name: 'Cidades', icon: Building2, path: '/cidades' },
    { name: 'Notícias', icon: Newspaper, path: '/noticias' } 
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Globe size={28} color="#6366f1" />
        <span>Mundo App</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="sidebar-item-icon" />
            <span className="sidebar-item-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>© 2026 Projeto Mundo</p>
      </div>
    </aside>
  );
};

export default Sidebar;