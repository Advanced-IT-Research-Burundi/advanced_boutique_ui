import React, { useEffect } from 'react'
import RapportHeader from './RapportHeader'
import { useDispatch, useSelector } from 'react-redux'
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';

function ReportStockBillanScreen() {
    const dispatch = useDispatch();
    const { data, loading } = useSelector((state) => state.apiData);

    useEffect(() => {
        dispatch(fetchApiData({
            url: '/api/stock_billan',
            itemKey: 'STOCK_BILLAN'
        }))
    }, [dispatch]);

    const stockData = data?.STOCK_BILLAN?.stock_produits || [];
    const totalGlobal = stockData.reduce((acc, item) => acc + (parseFloat(item.total_value) || 0), 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-BI', { 
            style: 'currency', 
            currency: 'BIF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="container-fluid">
            <RapportHeader />
            
            <div className="card shadow-sm border-0 mt-4">
                <div className="card-header bg-white py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-success fw-bold">
                            <i className="pi pi-box me-2"></i>
                            Bilan global des Stocks
                        </h5>
                        <span className="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                             Total: {formatCurrency(totalGlobal)}
                        </span>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted">
                                <tr>
                                    <th scope="col" className="ps-4" style={{ width: '80px' }}>#ID</th>
                                    <th scope="col">Nom du Stock / Point de Vente</th>
                                    <th scope="col" className="text-end pe-4">Valeur Totale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && !data ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5">
                                            <div className="spinner-border text-success" role="status">
                                                <span className="visually-hidden">Chargement...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : stockData.length > 0 ? (
                                    stockData.map((stock, index) => (
                                        <tr key={stock.stock_id || index}>
                                            <td className="ps-4 text-muted">#{stock.stock_id}</td>
                                            <td className="fw-medium text-dark">{stock.stock_name}</td>
                                            <td className="text-end pe-4 fw-bold text-success font-monospace">
                                                {formatCurrency(stock.total_value)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5 text-muted">
                                            <i className="pi pi-info-circle fs-3 d-block mb-2"></i>
                                            Aucune donnée de stock disponible
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {stockData.length > 0 && (
                                <tfoot className="bg-light">
                                    <tr>
                                        <td colSpan="2" className="text-end fw-bold py-3">TOTAL GÉNÉRAL</td>
                                        <td className="text-end pe-4 fw-bold text-success fs-5 py-3">
                                            {formatCurrency(totalGlobal)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportStockBillanScreen