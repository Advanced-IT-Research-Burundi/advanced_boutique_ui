import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ImportHeader = () => {
    const location = useLocation();
    const activePath = location.pathname;

    const navItems = [
        { path: '/commandes', label: 'Bon de commandes', icon: 'pi pi-file' },
        { path: '/commandes-lists', label: 'Liste des commandes', icon: 'pi pi-list' },
        { path: '/livraison', label: 'Bon de livraison', icon: 'pi pi-truck' },
        { path: '/bonEntre', label: "Historique des bons d'entre", icon: 'pi pi-history' },
        { path: '/importFile', label: "Import de fichier des données d'usines", icon: 'pi pi-upload' },
    ];

    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-white border-bottom-0 pb-0">
                <ul className="nav nav-tabs card-header-tabs border-bottom-0">
                    {navItems.map((item) => {
                        const isActive = activePath === item.path;
                        return (
                            <li className="nav-item" key={item.path}>
                                <Link 
                                    to={item.path} 
                                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active' : ''}`}
                                    style={{
                                        color: isActive ? '#32A624' : '#6c757d',
                                        fontWeight: isActive ? '600' : '400',
                                        border: 'none',
                                        borderBottom: isActive ? '3px solid #32A624' : '3px solid transparent',
                                        backgroundColor: 'transparent',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <i className={`${item.icon} ${isActive ? 'fw-bold' : ''}`}></i>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ImportHeader;
