import React, { useState } from 'react';
import ApiService from '../../services/api.js';

const FIELDS = [
  { name: 'product_code', label: 'Code produit', required: true },
  { name: 'company_code', label: 'Code usine' },
  { name: 'item_name', label: 'Désignation', required: true, col: 'col-12' },
  { name: 'size', label: 'Taille' },
  { name: 'packing_details', label: 'Conditionnement' },
  { name: 'mfg_location', label: 'Lieu de fabrication' },
  { name: 'weight_kg', label: 'Poids (kg)', type: 'number' },
  { name: 'order_qty', label: 'Qté commandée', type: 'number' },
  { name: 'total_weight', label: 'Poids total', type: 'number' },
  { name: 'pu', label: 'PU' },
  { name: 'total_weight_pu', label: 'Poids total x PU', type: 'number' },
];

const emptyForm = FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});

const ManualProductForm = ({ onSaved, onError }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // N'envoyer que les champs renseignés (les autres sont nullable côté API)
    const payload = Object.fromEntries(
      Object.entries(form)
        .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
        .filter(([, v]) => v !== '')
    );

    try {
      await ApiService.post('/api/product-company-names', payload);
      onSaved?.(payload);
      setForm(emptyForm);
    } catch (error) {
      onError?.(error.message || "Erreur lors de l'enregistrement du produit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-2">
        {FIELDS.map(f => (
          <div key={f.name} className={f.col || 'col-md-6'}>
            <label className="form-label small mb-1">
              {f.label}{f.required && <span className="text-danger"> *</span>}
            </label>
            <input
              className="form-control form-control-sm"
              type={f.type || 'text'}
              step={f.type === 'number' ? 'any' : undefined}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              required={f.required}
              disabled={saving}
            />
          </div>
        ))}
      </div>
      <div className="d-grid mt-3">
        <button type="submit" className="btn btn-success" disabled={saving}>
          <i className="pi pi-plus me-2"></i>
          {saving ? 'Enregistrement...' : 'Ajouter le produit'}
        </button>
      </div>
    </form>
  );
};

export default ManualProductForm;
