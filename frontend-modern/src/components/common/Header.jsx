import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown, Badge, Nav } from 'react-bootstrap';
import { Bell, Person, Gear, BoxArrowRight, Justify } from 'react-bootstrap-icons';

const Header = ({ toggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`main-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <button
            className="btn btn-link text-dark p-2"
            onClick={toggleSidebar}
            style={{ fontSize: '1.5rem' }}
          >
            <Justify />
          </button>
          <h5 className="mb-0 text-gradient">City Connector</h5>
        </div>
        
        <div className="header-right">
          {/* Notifications */}
          <div className="position-relative me-3">
            <button className="btn btn-link text-dark position-relative p-2">
              <Bell size={20} />
              <Badge
                pill
                bg="danger"
                className="position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: '0.6rem' }}
              >
                3
              </Badge>
            </button>
          </div>

          {/* User Dropdown */}
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="text-dark text-decoration-none d-flex align-items-center gap-2 p-2"
              id="user-dropdown"
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="d-none d-md-block">
                  <div className="fw-semibold small">{user?.name || 'User'}</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    {user?.role || 'Guest'}
                  </div>
                </div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu align="end" className="shadow border-0">
              <Dropdown.Header className="text-muted small">
                Signed in as {user?.email}
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item className="d-flex align-items-center gap-2">
                <Person size={16} />
                Profile
              </Dropdown.Item>
              <Dropdown.Item className="d-flex align-items-center gap-2">
                <Gear size={16} />
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={handleLogout}
                className="d-flex align-items-center gap-2 text-danger"
              >
                <BoxArrowRight size={16} />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
