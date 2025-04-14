import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faQuestionCircle, 
  faInbox, 
  faVideo, 
  faCog, 
  faQuestion 
} from '@fortawesome/free-solid-svg-icons';
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
      icon: faChartBar,
      path: '/dashboard',
    },
    {
      title: 'Questions',
      icon: faQuestionCircle,
      path: '/dashboard/questions',
    },
    {
      title: 'Requests',
      icon: faInbox,
      path: '/dashboard/requests',
    },
    {
      title: 'Testimonials',
      icon: faVideo,
      path: '/dashboard/testimonials',
    },
    {
      title: 'Settings',
      icon: faCog,
      path: '/settings',
    },
  ];

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
                <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                {!collapsed && <span className="nav-title">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="help-link">
          <FontAwesomeIcon icon={faQuestion} className="nav-icon" />
          {!collapsed && <span className="nav-title">Help & Support</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
