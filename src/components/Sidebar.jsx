import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import { getMenuItems } from '../config/routeConfig.js';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const menuItems = getMenuItems();

  return (
    <>
      <Tooltip target=".nav-link-collapsed" position="right" />
      <nav 
        className="sidebar shadow-lg"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          height: '100vh',
          background: 'linear-gradient(180deg, var(--sidebar-bg) 0%, var(--secondary-blue) 100%)',
          color: 'var(--sidebar-color)',
          zIndex: 1000,
          transition: 'width 0.3s ease',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div 
          className="sidebar-brand d-flex align-items-center justify-content-center py-3"
          style={{ 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            height: 'var(--navbar-height)',
            minHeight: 'var(--navbar-height)'
          }}
        >
          <i className="pi pi-desktop me-2" style={{ fontSize: '1.5rem' }}></i>
          {!isCollapsed && (
            <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
              Advanced IT
            </span>
          )}
        </div>

        <ul className="sidebar-nav list-unstyled p-0 mt-3">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item mb-1">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center text-decoration-none ${
                  location.pathname === item.path ? 'active' : ''
                } ${isCollapsed ? 'nav-link-collapsed' : ''}`}
                style={{
                  color: 'var(--sidebar-color)',
                  backgroundColor: location.pathname === item.path ? 'var(--sidebar-active-bg)' : 'transparent',
                  transition: 'all 0.3s ease',
                  padding: isCollapsed ? '12px' : '12px 20px',
                  margin: '0 8px',
                  borderRadius: '8px',
                  position: 'relative',
                  justifyContent: isCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-bg)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
                data-pr-tooltip={isCollapsed ? item.label : ''}
              >
                <i className={`${item.icon}`} style={{ fontSize: '1.2rem' }}></i>
                {!isCollapsed && (
                  <span className="ms-3 fw-medium">{item.label}</span>
                )}
                {location.pathname === item.path && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '20px',
                      backgroundColor: '#fff',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Overlay pour mobile */}
      {!isCollapsed && window.innerWidth <= 991 && (
        <div 
          className="overlay d-block d-lg-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;