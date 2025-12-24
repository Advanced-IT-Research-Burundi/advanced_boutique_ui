import React, { useState, useEffect } from 'react'
import RapportHeader from './RapportHeader'
import { useSelector, useDispatch } from 'react-redux'
import { fetchApiData } from '../../stores/slicer/apiDataSlicer'
import { API_CONFIG } from '../../services/config'
import ApiService from '../../services/api'

function ReportCreditTvaScreen() {
    const { data, loading } = useSelector(state => state.apiData);
    const dispatch = useDispatch();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        date: '',
        montant: '',
        description: '',
        type: 'ADD'
    });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadCreditTva(page, search);
    }, [page, search]);

    const loadCreditTva = async (pageNb = 1, searchQuery = '') => {
        try {
            let url = `${API_CONFIG.ENDPOINTS.CREDIT_TVA_DETAILS}?page=${pageNb}`;
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }
            await dispatch(fetchApiData({ url: url, itemKey: 'creditTvaDetails' }));
        } catch (error) {
            console.log(error);
        }
    }

    const handleSave = async () => {
        try {
            setProcessing(true);
            const payload = { ...formData };
            // Ensure ID is not sent in payload if it's null or for clean updates, or keep it if backend doesn't care.
            // Usually for REST, ID is in URL.
            
            if (isEditing && formData.id) {
                await ApiService.put(`${API_CONFIG.ENDPOINTS.CREDIT_TVA_DETAILS}/${formData.id}`, payload);
            } else {
               await ApiService.post(API_CONFIG.ENDPOINTS.CREDIT_TVA_DETAILS, payload);
            }
            
            await loadCreditTva(page, search);
            closeModal();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
            try {
                await ApiService.delete(`${API_CONFIG.ENDPOINTS.CREDIT_TVA_DETAILS}/${id}`);
                await loadCreditTva(page, search);
            } catch (error) {
                console.error(error);
                alert("Une erreur est survenue lors de la suppression.");
            }
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };
    
    // Derived data safely
    const creditTvaDetails = data?.creditTvaDetails?.credit_tva_details || {};
    const creditTvaTotal = data?.creditTvaDetails?.credit_tva || {};
    const pagination = creditTvaDetails; // The API response structure puts pagination info directly on credit_tva_details object

    const openModal = (item = null) => {
        if (item) {
            setIsEditing(true);
            setFormData({
                id: item.id,
                date: item.date,
                montant: item.montant,
                description: item.description,
                type: item.type
            });
        } else {
            setIsEditing(false);
            setFormData({
                id: null,
                date: new Date().toISOString().split('T')[0],
                montant: '',
                description: '',
                type: 'ADD'
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ id: null, date: '', montant: '', description: '', type: 'ADD' });
    };

    return (
        <>
            <RapportHeader />
            <div className="container-fluid py-4">
                {/* Header Stats */}
               <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-0 text-white" style={{ backgroundColor: 'var(--primary-blue)' }}>
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-0">Total Crédit TVA</h5>
                                    <small className="opacity-75">Solde actuel</small>
                                </div>
                                <h2 className="mb-0 fw-bold">
                                    {new Intl.NumberFormat('fr-FR').format(creditTvaTotal.montant || 0)} FBU
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="col-md-6 text-md-end">
                                <button className="btn btn-primary" onClick={() => openModal()}>
                                    <i className="bi bi-plus-lg me-2"></i> Ajouter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                       <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Date</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th className="text-end">Montant</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { creditTvaDetails.data && creditTvaDetails.data.length > 0 ? (
                                        creditTvaDetails.data.map((item) => (
                                            <tr key={item.id}>
                                                <td className="ps-4">{item.date}</td>
                                                <td>
                                                    <span className={`badge ${item.type === 'ADD' ? 'bg-success' : 'bg-danger'}`}>
                                                        {item.type === 'ADD' ? 'AJOUT' : 'RETRAIT'}
                                                    </span>
                                                </td>
                                                <td>{item.description}</td>
                                                <td className="text-end fw-bold">
                                                    {new Intl.NumberFormat('fr-FR').format(item.montant)} FBU
                                                </td>
                                                <td className="text-end pe-4">
                                                    <button 
                                                        className="btn btn-sm btn-outline-secondary me-2"
                                                        onClick={() => openModal(item)}
                                                    >
                                                        Modifier
                                                        <i className="pi pi-pencil"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        Supprimer
                                                        <i className="pi pi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colspan="5" className="text-center py-4 text-muted">Aucune donnée trouvée</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                       </div>
                    </div>
                    {/* Pagination */}
                    {pagination && pagination.links && (
                        <div className="card-footer bg-white border-0 py-3">
                            <nav>
                                <ul className="pagination justify-content-center mb-0">
                                    {pagination.links.map((link, index) => (
                                        <li key={index} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => link.url && setPage(new URL(link.url).searchParams.get('page'))}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            ></button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabindex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{isEditing ? 'Modifier' : 'Ajouter'} Crédit TVA</h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                                        <div className="mb-3">
                                            <label className="form-label">Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Type</label>
                                            <select
                                                className="form-select"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="ADD">AJOUT (Crédit)</option>
                                                <option value="SUB">RETRAIT (Debit)</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Montant</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.montant}
                                                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={handleSave}
                                        disabled={processing}
                                    >
                                        {processing ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default ReportCreditTvaScreen