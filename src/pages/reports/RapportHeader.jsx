import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function RapportHeader() {
    const location = useLocation();
    const activePath = location.pathname;

    const reportItems = [
        { path: '/reports/financial', label: 'Rapports des depenses Annuelles', icon: 'pi pi-chart-line' },
        { path: '/reports/credit-tva', label: 'Enregistrement crédits TVA', icon: 'pi pi-percentage' },
        { path: '/reports/stock_billan', label: 'Bilan des Stocks', icon: 'pi pi-box' },
        { path: '/reports/autres_elements', label: 'Autres Elements', icon: 'pi pi-list' },
    ];

    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-white border-bottom-0 pb-0">
                <ul className="nav nav-tabs card-header-tabs border-bottom-0">
                    {reportItems.map((item) => {
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
}

export default RapportHeader;