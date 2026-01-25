import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReportHeader from './RapportHeader';
import ApiService from '../../services/api';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';

function AutreElementScreen() {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        date: '',
        libelle: '',
        emplacement: '',
        quantite: '',
        valeur: '',
        devise: 'BIF',
        type_element: 'autre',
        reference: '',
        observation: '',
        exchange_rate: '1',
        document: null
    });
    const toast = useRef(null);
    const fileInputRef = useRef(null);

    const typeElementOptions = [
        { value: 'caisse', label: 'Caisse' },
        { value: 'banque', label: 'Banque' },
        { value: 'avance', label: 'Avance' },
        { value: 'credit', label: 'Crédit' },
        { value: 'investissement', label: 'Investissement' },
        { value: 'immobilisation', label: 'Immobilisation' },
        { value: 'autre', label: 'Autre' }
    ];

    const dispatch = useDispatch();
    const autreElements = useSelector((state) => state.apiData?.data?.autreElements);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const url = `/api/autre-elements?page=${page}`;
            await dispatch(fetchApiData({ url, itemKey: 'autreElements' })).unwrap();
            setCurrentPage(page);
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des données' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        if (searchTerm || filterType) {
            // Don't fetch, just filter locally
            // Pagination will work on filtered results
        }
    }, [searchTerm, filterType]);

    // Filtered data based on search and filter
    const filteredData = useMemo(() => {
        if (!autreElements?.data) return [];
        
        let filtered = autreElements.data;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.emplacement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.observation?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (filterType) {
            filtered = filtered.filter(item => item.type_element === filterType);
        }

        return filtered;
    }, [autreElements, searchTerm, filterType]);

    const getFileType = (url) => {
        if (!url) return null;
        const extension = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
        if (extension === 'pdf') return 'pdf';
        if (['doc', 'docx'].includes(extension)) return 'word';
        return 'file';
    };

    const getFileIcon = (url) => {
        const type = getFileType(url);
        switch (type) {
            case 'image': return 'pi-image';
            case 'pdf': return 'pi-file-pdf';
            case 'word': return 'pi-file-word';
            default: return 'pi-file';
        }
    };

    const viewDocument = (documentUrl) => {
        if (!documentUrl) return;
        setSelectedDocument(documentUrl);
        setShowDocumentModal(true);
    };

    const getDocumentUrl = (path) => {
        if (!path) return null;
        // If path already starts with http, return as is
        if (path.startsWith('http')) return path;
        // Otherwise, construct the full URL
        const baseUrl = import.meta.env.VITE_APP_DEV_MODE_LOCAL === 'true' 
            ? import.meta.env.VITE_APP_BASE_URL_LOCAL 
            : import.meta.env.VITE_APP_BASE_URL;
        return `${baseUrl}/${path}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, document: e.target.files[0] }));
    };

    const openNew = () => {
        setEditingItem(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            libelle: '',
            emplacement: '',
            quantite: '',
            valeur: '',
            devise: 'BIF',
            type_element: 'autre',
            reference: '',
            observation: '',
            exchange_rate: '1',
            document: null
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({
            date: item.date || '',
            libelle: item.libelle || '',
            emplacement: item.emplacement || '',
            quantite: item.quantite || '',
            valeur: item.valeur || '',
            devise: item.devise || 'BIF',
            type_element: item.type_element || 'autre',
            reference: item.reference || '',
            observation: item.observation || '',
            exchange_rate: item.exchange_rate || '1',
            document: null 
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowModal(true);
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'document' && formData[key]) {
                dataToSend.append(key, formData[key]);
            } else if (key !== 'document') {
                dataToSend.append(key, formData[key] || '');
            }
        });

        if (editingItem && editingItem.id) {
            dataToSend.append('_method', 'PUT');
        }

        for (let [key, value] of dataToSend.entries()) {
            console.log(key, value);
        }

        try {
            let response;
            if (editingItem) {
                response = await ApiService.uploadFile(`/api/autre-elements/${editingItem.id}`, dataToSend, 'PUT');
            } else {
                response = await ApiService.uploadFile('/api/autre-elements', dataToSend, 'POST');
            }

            if (response.success) {
                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Opération réussie' });
                setShowModal(false);
                fetchData();
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: response.message || 'Une erreur est survenue' });
            }
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur de connexion' });
        }
    };

    const handleDelete = (item) => {
        confirmDialog({
            message: 'Voulez-vous vraiment supprimer cet élément ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    const response = await ApiService.delete(`/api/autre-elements/${item.id}`);
                    if (response.success) {
                        toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Élément supprimé' });
                        fetchData();
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Erreur', detail: response.message });
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression' });
                }
            }
        });
    };

    const formatCurrency = (amount, currency = 'BIF') => {
        return new Intl.NumberFormat('fr-BI', { 
            style: 'currency', 
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const totalAmount = filteredData?.reduce((total, item) => total + (item.valeur * item.quantite * item.exchange_rate || 0), 0);
    return (
        <div className="container-fluid">
            <ReportHeader />
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="card shadow-sm border-0 mt-4">
                <div className="card-header bg-white py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 text-success fw-bold">
                            <i className="pi pi-list me-2"></i>
                            Autres Éléments
                        </h5>
                        <button className="btn btn-success btn-sm" onClick={openNew}>
                            <i className="pi pi-plus me-2"></i>
                            Ajouter
                        </button>
                    </div>
                    <div className="row g-2">
                        <div className="col-md-6">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="pi pi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Rechercher par libellé, emplacement, référence..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">Tous les types</option>
                                {typeElementOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 text-end">
                            <span className="badge bg-light text-dark border">
                                {filteredData.length} élément{filteredData.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted">
                                <tr>
                                    <th>#</th>
                                    <th className="ps-4">Date</th>
                                    <th>Libellé</th>
                                    <th>Type</th>
                                    <th>Emplacement</th>
                                    <th>Quantité</th>
                                    <th>Valeur</th>
                                    <th>Taux</th>
                                    <th> Montant En FBU</th>
                                    <th>Document</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <div className="spinner-border text-success" role="status">
                                                <span className="visually-hidden">Chargement...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td className="ps-4 text-nowrap">{item.date}</td>
                                            <td className="fw-medium">{item.libelle}</td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {typeElementOptions.find(opt => opt.value === item.type_element)?.label || item.type_element}
                                                </span>
                                            </td>
                                            <td>{item.emplacement || '-'}</td>
                                            <td>{item.quantite}</td>
                                            <td className="font-monospace text-success fw-bold">
                                                {formatCurrency(item.valeur, item.devise)}
                                            </td>
                                            <td>{item.exchange_rate}</td>
                                            <td>{formatCurrency(item.exchange_rate * item.valeur)}</td>
                                            <td>
                                                {item.document ? (
                                                    <button
                                                        className="btn btn-link btn-sm p-0 text-decoration-none"
                                                        onClick={() => viewDocument(getDocumentUrl(item.document))}
                                                    >
                                                        <i className={`pi ${getFileIcon(item.document)} me-1`}></i>
                                                        Voir
                                                    </button>
                                                ) : (
                                                    <span className="text-muted small">-</span>
                                                )}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="btn-group">
                                                    <button className="btn btn-outline-primary btn-sm border-0" onClick={() => openEdit(item)}>
                                                        <i className="pi pi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleDelete(item)}>
                                                        <i className="pi pi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5 text-muted">
                                            {searchTerm || filterType ? 'Aucun élément trouvé avec ces critères' : 'Aucun élément trouvé'}
                                        </td>
                                    </tr>
                                )}

                                <tr>
                                    <td className="" colSpan="8">TOTAL</td>
                                    <td>{formatCurrency(totalAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                    </div>
                </div>
                
                {/* Pagination */}
                {autreElements && autreElements.last_page > 1 && (
                    <div className="card-footer bg-white border-top">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted small">
                                {searchTerm || filterType ? (
                                    `${filteredData.length} élément${filteredData.length > 1 ? 's' : ''} trouvé${filteredData.length > 1 ? 's' : ''}`
                                ) : (
                                    `Affichage de ${autreElements.from || 0} à ${autreElements.to || 0} sur ${autreElements.total || 0} éléments`
                                )}
                            </div>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    {/* Previous Button */}
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => fetchData(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="pi pi-angle-left"></i>
                                        </button>
                                    </li>

                                    {/* Page Numbers */}
                                    {(() => {
                                        const pages = [];
                                        const totalPages = autreElements.last_page;
                                        let startPage = Math.max(1, currentPage - 2);
                                        let endPage = Math.min(totalPages, currentPage + 2);

                                        // Adjust if we're near the start
                                        if (currentPage <= 3) {
                                            endPage = Math.min(5, totalPages);
                                        }

                                        // Adjust if we're near the end
                                        if (currentPage >= totalPages - 2) {
                                            startPage = Math.max(1, totalPages - 4);
                                        }

                                        // First page
                                        if (startPage > 1) {
                                            pages.push(
                                                <li key={1} className="page-item">
                                                    <button className="page-link" onClick={() => fetchData(1)}>
                                                        1
                                                    </button>
                                                </li>
                                            );
                                            if (startPage > 2) {
                                                pages.push(
                                                    <li key="ellipsis-start" className="page-item disabled">
                                                        <span className="page-link">...</span>
                                                    </li>
                                                );
                                            }
                                        }

                                        // Page numbers
                                        for (let i = startPage; i <= endPage; i++) {
                                            pages.push(
                                                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => fetchData(i)}>
                                                        {i}
                                                    </button>
                                                </li>
                                            );
                                        }

                                        // Last page
                                        if (endPage < totalPages) {
                                            if (endPage < totalPages - 1) {
                                                pages.push(
                                                    <li key="ellipsis-end" className="page-item disabled">
                                                        <span className="page-link">...</span>
                                                    </li>
                                                );
                                            }
                                            pages.push(
                                                <li key={totalPages} className="page-item">
                                                    <button className="page-link" onClick={() => fetchData(totalPages)}>
                                                        {totalPages}
                                                    </button>
                                                </li>
                                            );
                                        }

                                        return pages;
                                    })()}

                                    {/* Next Button */}
                                    <li className={`page-item ${currentPage === autreElements.last_page ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => fetchData(currentPage + 1)}
                                            disabled={currentPage === autreElements.last_page}
                                        >
                                            <i className="pi pi-angle-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            <Dialog 
                header={editingItem ? "Modifier l'élément" : "Nouvel élément"} 
                visible={showModal} 
                style={{ width: '60vw', minWidth: '350px' }} 
                onHide={() => setShowModal(false)}
            >
                <form onSubmit={handleSubmit} className="p-fluid" id="form" encType="multipart/form-data">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Date <span className="text-danger">*</span></label>
                            <input type="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Type d'élément <span className="text-danger">*</span></label>
                            <select name="type_element" className="form-select" value={formData.type_element} onChange={handleInputChange} required>
                                {typeElementOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Libellé <span className="text-danger">*</span></label>
                            <input type="text" name="libelle" className="form-control" placeholder="Nom de l'élément" value={formData.libelle} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Quantité <span className="text-danger">*</span></label>
                            <input type="number" name="quantite" className="form-control" placeholder="0" value={formData.quantite} onChange={handleInputChange} required min="0" step="any" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Emplacement</label>
                            <input type="text" name="emplacement" className="form-control" placeholder="Lieu de stockage" value={formData.emplacement} onChange={handleInputChange} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Valeur <span className="text-danger">*</span></label>
                            <input type="number" name="valeur" className="form-control" placeholder="Montant" value={formData.valeur} onChange={handleInputChange} required min="0" step="0.01" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Devise <span className="text-danger">*</span></label>
                            <select name="devise" className="form-select" value={formData.devise} onChange={handleInputChange} required>
                                <option value="BIF">BIF</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                         <div className="col-md-4">
                            <label className="form-label">Taux de change <span className="text-danger">*</span></label>
                            <input type="number" name="exchange_rate" className="form-control" placeholder="1" value={formData.exchange_rate} onChange={handleInputChange} required min="1" step="0.0001" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Référence</label>
                            <input type="text" name="reference" className="form-control" placeholder="Réf. document / Interne" value={formData.reference} onChange={handleInputChange} maxLength="100"/>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Document (PDF, Image, Word)</label>
                            <input 
                                type="file" 
                                name="document" 
                                className="form-control" 
                                onChange={handleFileChange} 
                                ref={fileInputRef}
                                accept=".pdf,.doc,.docx,image/*"
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Observation</label>
                            <textarea name="observation" className="form-control" rows="3" value={formData.observation} onChange={handleInputChange}></textarea>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                        <button type="submit" className="btn btn-success">Enregistrer</button>
                    </div>
                </form>
            </Dialog>

            {/* Document Viewer Modal */}
            <Dialog
                header="Visualisation du document"
                visible={showDocumentModal}
                style={{ width: '70vw', minWidth: '350px' }}
                onHide={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                }}
                maximizable
            >
                {selectedDocument && (
                    <div className="text-center">
                        {getFileType(selectedDocument) === 'image' ? (
                            <img
                                src={selectedDocument}
                                alt="Document"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '70vh', objectFit: 'contain' }}
                            />
                        ) : getFileType(selectedDocument) === 'pdf' ? (
                            <div>
                                <iframe
                                    src={selectedDocument}
                                    style={{ width: '100%', height: '70vh', border: 'none' }}
                                    title="PDF Viewer"
                                />
                                <div className="mt-3">
                                    <a
                                        href={selectedDocument}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        <i className="pi pi-external-link me-2"></i>
                                        Ouvrir dans un nouvel onglet
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="py-5">
                                <i className="pi pi-file" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <p className="mt-3 text-muted">
                                    Ce type de fichier ne peut pas être prévisualisé directement.
                                </p>
                                <a
                                    href={selectedDocument}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    download
                                >
                                    <i className="pi pi-download me-2"></i>
                                    Télécharger le fichier
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default AutreElementScreen;