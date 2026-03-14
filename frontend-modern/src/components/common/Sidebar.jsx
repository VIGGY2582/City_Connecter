import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  House,
  FileText,
  People,
  Building,
  Gear,
  BarChart,
  Bell,
  QuestionCircle,
} from 'react-bootstrap-icons';

const Sidebar = ({ collapsed, show }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: House,
      roles: ['admin', 'department', 'citizen'],
    },
    {
      path: '/complaints',
      name: 'Complaints',
      icon: FileText,
      roles: ['admin', 'department', 'citizen'],
    },
    {
      path: '/users',
      name: 'Users',
      icon: People,
      roles: ['admin'],
    },
    {
      path: '/departments',
      name: 'Departments',
      icon: Building,
      roles: ['admin'],
    },
    {
      path: '/analytics',
      name: 'Analytics',
      icon: BarChart,
      roles: ['admin', 'department'],
    },
    {
      path: '/notifications',
      name: 'Notifications',
      icon: Bell,
      roles: ['admin', 'department', 'citizen'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${show ? 'show' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="sidebar-logo">
          <Building size={collapsed ? 24 : 28} />
          {!collapsed && <span>City Connect</span>}
        </NavLink>
      </div>
      
      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <div key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.name : ''}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-footer mt-auto">
        <div className="nav-item">
          <NavLink
            to="/help"
            className="nav-link"
            title={collapsed ? 'Help & Support' : ''}
          >
            <QuestionCircle size={20} />
            {!collapsed && <span>Help & Support</span>}
          </NavLink>
        </div>
        
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="text-white-50 small text-center">
              <div>Version 1.0.0</div>
              <div>© 2024 City Connect</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
