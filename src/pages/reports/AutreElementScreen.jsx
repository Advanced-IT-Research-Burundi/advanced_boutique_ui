import React, { useState, useEffect, useRef } from 'react';
import ReportHeader from './RapportHeader';
import ApiService from '../../services/api';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

function AutreElementScreen() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get('/api/autre-elements');
            if (response.success) {
                setData(response.data);
            } else {
                 setData(response.data || []);
            }
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des données' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

        try {
            let response;
            if (editingItem) {
                response = await ApiService.put(`/api/autre-elements/${editingItem.id}`, dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                console.log("dataToSend", dataToSend.values());
                response = await ApiService.post('/api/autre-elements', dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
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

    return (
        <div className="container-fluid">
            <ReportHeader />
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="card shadow-sm border-0 mt-4">
                <div className="card-header bg-white py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-success fw-bold">
                            <i className="pi pi-list me-2"></i>
                            Autres Éléments
                        </h5>
                        <button className="btn btn-success btn-sm" onClick={openNew}>
                            <i className="pi pi-plus me-2"></i>
                            Ajouter
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted">
                                <tr>
                                    <th className="ps-4">Date</th>
                                    <th>Libellé</th>
                                    <th>Type</th>
                                    <th>Emplacement</th>
                                    <th>Quantité</th>
                                    <th>Valeur</th>
                                    <th>Taux</th>
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
                                ) : data.length > 0 ? (
                                    data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="ps-4 text-nowrap">{item.date}</td>
                                            <td className="fw-medium">{item.libelle}</td>
                                            <td><span className="badge bg-light text-dark border">{item.type_element}</span></td>
                                            <td>{item.emplacement}</td>
                                            <td>{item.quantite}</td>
                                            <td className="font-monospace text-success fw-bold">
                                                {formatCurrency(item.valeur, item.devise)}
                                            </td>
                                            <td>{item.exchange_rate}</td>
                                            <td>
                                                {item.document ? (
                                                    <a href={item.document} target="_blank" rel="noopener noreferrer" className="btn btn-link btn-sm p-0 text-decoration-none">
                                                        <i className="pi pi-file me-1"></i>
                                                        Voir
                                                    </a>
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
                                            Aucun élément trouvé
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog 
                header={editingItem ? "Modifier l'élément" : "Nouvel élément"} 
                visible={showModal} 
                style={{ width: '60vw', minWidth: '350px' }} 
                onHide={() => setShowModal(false)}
            >
                <form onSubmit={handleSubmit} className="p-fluid">
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
        </div>
    );
}

export default AutreElementScreen;