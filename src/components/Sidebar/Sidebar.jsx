import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
    },
    {
      title: 'Questions',
      icon: '❔',
      path: '/dashboard/questions',
    },
    {
      title: 'Requests',
      icon: '📥', 
      path: '/dashboard/requests',
    },
    {
      title: 'Testimonials',
      icon: '🎬',
      path: '/dashboard/testimonials',
    },
    {
      title: 'Settings',
      icon: '⚙️',
      path: '/settings',
    },
  ];

  // Check if the current path matches or starts with a nav item path
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          {collapsed ? '➡️' : '⬅️'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item, index) => (
            <li key={index} className={isActive(item.path) ? 'active' : ''}>
              <Link to={item.path}>
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-title">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="help-link">
          <span className="nav-icon">❓</span>
          {!collapsed && <span className="nav-title">Help & Support</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;