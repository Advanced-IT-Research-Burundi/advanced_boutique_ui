import React, { useEffect, useState } from 'react'
import RapportHeader from './RapportHeader'
import { useDispatch, useSelector } from 'react-redux'
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { MultiSelect } from 'primereact/multiselect';

function ReportStockBillanScreen() {
    const dispatch = useDispatch();
    const { data, loading } = useSelector((state) => state.apiData);
    const [selectedStocks, setSelectedStocks] = useState(null);

    useEffect(() => {
        dispatch(fetchApiData({
            url: '/api/stock_billan',
            itemKey: 'STOCK_BILLAN'
        }))
    }, [dispatch]);

    const stockData = data?.STOCK_BILLAN?.stock_produits || [];
    
    // Filter data based on selection
    const filteredStockData = selectedStocks && selectedStocks.length > 0 
        ? stockData.filter(stock => selectedStocks.some(s => s.stock_id === stock.stock_id))
        : stockData;

    const totalGlobal = filteredStockData.reduce((acc, item) => acc + (parseFloat(item.total_value) || 0), 0);

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
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <h5 className="mb-0 text-success fw-bold">
                            <i className="pi pi-box me-2"></i>
                            Bilan global des Stocks
                        </h5>
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon bg-light border-end-0">
                                    <i className="pi pi-filter text-muted"></i>
                                </span>
                                <MultiSelect 
                                    value={selectedStocks}
                                    options={stockData} 
                                    onChange={(e) => setSelectedStocks(e.value)} 
                                    optionLabel="stock_name" 
                                    placeholder="Filtrer par stock"
                                    maxSelectedLabels={2}
                                    className="w-full md:w-20rem border-start-0"
                                    display="chip"
                                    filter
                                />
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                                 Total: {formatCurrency(totalGlobal)}
                            </span>
                        </div>
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
                                ) : filteredStockData.length > 0 ? (
                                    filteredStockData.map((stock, index) => (
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
                                            <div className="d-flex flex-column align-items-center">
                                                <i className="pi pi-search fs-3 mb-2 opacity-50"></i>
                                                <span>Aucun stock trouvé pour cette sélection</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-light">
                                <tr>
                                    <td colSpan="2" className="text-end fw-bold py-3">TOTAL GÉNÉRAL</td>
                                    <td className="text-end pe-4 fw-bold text-success fs-5 py-3">
                                        {formatCurrency(totalGlobal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportStockBillanScreen