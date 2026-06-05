import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useIntl } from 'react-intl';
import ApiService from '../../services/api.js';

const ProductImportModal = ({ show, onClose, onSuccess }) => {
  const intl = useIntl();
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [workbook, setWorkbook] = useState(null);

  const fileInputRef = useRef(null);

  const hasData = data.length > 0;
  const dataRows = data.length > 0 ? data.length - 1 : 0;

  // Colonnes attendues pour l'import
  const expectedColumns = [
    { key: 'code', label: 'Code', required: true },
    { key: 'name', label: 'Nom', required: true },
    { key: 'category', label: 'Catégorie', required: false },
    { key: 'stock_id', label: 'ID Stock', required: false },
    { key: 'quantity', label: 'Quantité', required: false },
    { key: 'purchase_price', label: 'Prix d\'achat', required: true },
    { key: 'sale_price_ht', label: 'Prix vente HT', required: false },
    { key: 'sale_price_ttc', label: 'Prix vente TTC', required: true },
    { key: 'tva', label: 'TVA (%)', required: false },
    { key: 'unit', label: 'Unité', required: true },
    { key: 'alert_quantity', label: 'Seuil alerte', required: true },
    { key: 'description', label: 'Description', required: false },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      setErrors([intl.formatMessage({ id: 'productImport.invalidFileType' })]);
      return;
    }

    setFileName(file.name);
    setErrors([]);
    setImportResult(null);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target.result, { type: 'binary' });
        setWorkbook(wb);

        const sheetNames = wb.SheetNames;
        setSheets(sheetNames);

        const firstSheet = sheetNames[0];
        setActiveSheet(firstSheet);

        const worksheet = wb.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        setData(jsonData);
      } catch (error) {
        console.error('Error reading file:', error);
        setErrors([intl.formatMessage({ id: 'productImport.readError' })]);
        resetFileData();
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrors([intl.formatMessage({ id: 'productImport.readError' })]);
      setIsProcessing(false);
      resetFileData();
    };

    reader.readAsBinaryString(file);
  };

  const resetFileData = () => {
    setData([]);
    setFileName('');
    setSheets([]);
    setActiveSheet('');
    setWorkbook(null);
    setErrors([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchSheet = (sheetName) => {
    if (!workbook || !sheetName) return;

    setActiveSheet(sheetName);

    try {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setData(jsonData);
      setErrors([]);
    } catch (error) {
      setErrors([intl.formatMessage({ id: 'productImport.sheetError' })]);
    }
  };

  const handleImport = async () => {
    if (!hasData || dataRows === 0) {
      setErrors([intl.formatMessage({ id: 'productImport.noDataToImport' })]);
      return;
    }

    setLoading(true);
    setErrors([]);
    setImportResult(null);

    try {
      // Préparer les données pour l'import
      const headers = data[0];
      const rows = data.slice(1);

      // Filtrer les lignes vides et créer les objets produits
      const productsToImport = rows
        .filter(row => row && row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== ''))
        .map(row => {
          const product = {};
          headers.forEach((header, index) => {
            if (header && row[index] !== undefined && row[index] !== null && row[index] !== '') {
              // Normaliser le nom de la colonne
              const normalizedHeader = String(header).toLowerCase().trim().replace(/\s+/g, '_');
              product[normalizedHeader] = row[index];
            }
          });
          return product;
        })
        .filter(product => Object.keys(product).length > 0);

      if (productsToImport.length === 0) {
        setErrors([intl.formatMessage({ id: 'productImport.noDataToImport' })]);
        setLoading(false);
        return;
      }

      console.log('Products to import:', productsToImport);

      const response = await ApiService.post('/api/products/import', {
        products: productsToImport
      });

      console.log('Import response:', response);

      if (response.success) {
        setImportResult({
          success: true,
          imported: response.data?.imported || 0,
          failed: response.data?.failed || 0,
          errors: response.data?.errors || []
        });

        if (response.data?.errors && response.data.errors.length > 0) {
          setErrors(response.data.errors);
        }

        if (onSuccess && response.data?.imported > 0) {
          onSuccess();
        }
      } else {
        setErrors([response.message || intl.formatMessage({ id: 'productImport.importError' })]);
      }
    } catch (error) {
      console.error('Import error:', error);
      setErrors([error.message || intl.formatMessage({ id: 'productImport.importError' })]);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['code', 'name', 'category', 'stock_id', 'quantity', 'purchase_price', 'sale_price_ht', 'sale_price_ttc', 'tva', 'unit', 'alert_quantity', 'description'],
      ['PRD001', 'Produit Exemple', 'Catégorie 1', 1, 50, 1000, 1200, 1416, 18, 'Pièce', 10, 'Description du produit']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produits');

    // Ajuster la largeur des colonnes
    ws['!cols'] = [
      { wch: 10 }, // code
      { wch: 25 }, // name
      { wch: 15 }, // category
      { wch: 10 }, // stock_id
      { wch: 10 }, // quantity
      { wch: 12 }, // purchase_price
      { wch: 12 }, // sale_price_ht
      { wch: 14 }, // sale_price_ttc
      { wch: 8 },  // tva
      { wch: 10 }, // unit
      { wch: 12 }, // alert_quantity
      { wch: 30 }, // description
    ];

    XLSX.writeFile(wb, 'modele_import_produits.xlsx');
  };

  const handleClose = () => {
    resetFileData();
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="pi pi-file-excel me-2"></i>
                {intl.formatMessage({ id: 'productImport.title' })}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
                disabled={loading}
              ></button>
            </div>

            <div className="modal-body">
              {/* Instructions */}
              <div className="alert alert-info mb-4">
                <h6 className="alert-heading">
                  <i className="pi pi-info-circle me-2"></i>
                  {intl.formatMessage({ id: 'productImport.instructions' })}
                </h6>
                <p className="mb-2">{intl.formatMessage({ id: 'productImport.instructionsText' })}</p>
                <div className="row">
                  <div className="col-md-6">
                    <strong>{intl.formatMessage({ id: 'productImport.requiredColumns' })}:</strong>
                    <ul className="mb-0 small">
                      {expectedColumns.filter(c => c.required).map(col => (
                        <li key={col.key}>{col.label}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <strong>{intl.formatMessage({ id: 'productImport.optionalColumns' })}:</strong>
                    <ul className="mb-0 small">
                      {expectedColumns.filter(c => !c.required).map(col => (
                        <li key={col.key}>{col.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <hr />
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={downloadTemplate}
                >
                  <i className="pi pi-download me-1"></i>
                  {intl.formatMessage({ id: 'productImport.downloadTemplate' })}
                </button>
              </div>

              {/* File Upload */}
              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="pi pi-upload me-2"></i>
                    {intl.formatMessage({ id: 'productImport.selectFile' })}
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <input
                        ref={fileInputRef}
                        className="form-control"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        disabled={isProcessing || loading}
                      />
                    </div>
                    <div className="col-md-4">
                      {fileName && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={resetFileData}
                          disabled={loading}
                        >
                          <i className="pi pi-times me-1"></i>
                          {intl.formatMessage({ id: 'productImport.clearFile' })}
                        </button>
                      )}
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({ id: 'productImport.processing' })}</span>
                      </div>
                      <p className="mt-2 text-muted">{intl.formatMessage({ id: 'productImport.processing' })}</p>
                    </div>
                  )}

                  {fileName && !isProcessing && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong><i className="pi pi-file me-1"></i>{fileName}</strong>
                          <span className="text-muted ms-2">({dataRows} {intl.formatMessage({ id: 'productImport.rows' })})</span>
                        </div>
                        {sheets.length > 1 && (
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto' }}
                            value={activeSheet}
                            onChange={(e) => switchSheet(e.target.value)}
                          >
                            {sheets.map(sheet => (
                              <option key={sheet} value={sheet}>{sheet}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`alert ${importResult.success && importResult.failed === 0 ? 'alert-success' : 'alert-warning'} mb-4`}>
                  <h6 className="alert-heading">
                    <i className={`pi ${importResult.success ? 'pi-check-circle' : 'pi-exclamation-triangle'} me-2`}></i>
                    {intl.formatMessage({ id: 'productImport.importResult' })}
                  </h6>
                  <p className="mb-0">
                    <strong>{importResult.imported}</strong> {intl.formatMessage({ id: 'productImport.productsImported' })}
                    {importResult.failed > 0 && (
                      <span className="text-danger ms-2">
                        | <strong>{importResult.failed}</strong> {intl.formatMessage({ id: 'productImport.productsFailed' })}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="alert alert-danger mb-4">
                  <h6 className="alert-heading">
                    <i className="pi pi-exclamation-triangle me-2"></i>
                    {intl.formatMessage({ id: 'productImport.errors' })}
                  </h6>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {errors.map((error, index) => (
                      <div key={index} className="small">
                        {typeof error === 'string' ? error : JSON.stringify(error)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Preview */}
              {hasData && (
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="pi pi-table me-2"></i>
                      {intl.formatMessage({ id: 'productImport.preview' })}
                      <span className="badge bg-primary ms-2">{dataRows} {intl.formatMessage({ id: 'productImport.rows' })}</span>
                    </h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: '300px' }}>
                      <table className="table table-hover table-sm mb-0">
                        <thead className="bg-light sticky-top">
                          <tr>
                            <th style={{ width: '50px' }}>#</th>
                            {data[0]?.map((header, index) => (
                              <th key={index} className="text-nowrap">
                                {header || `Col ${index + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.slice(1, 51).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td className="text-muted">{rowIndex + 1}</td>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="text-nowrap">
                                  {cell !== null && cell !== undefined ? String(cell).substring(0, 50) : ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {dataRows > 50 && (
                      <div className="text-center text-muted small p-2 bg-light">
                        {intl.formatMessage({ id: 'productImport.showingFirst50' })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="pi pi-times me-1"></i>
                {intl.formatMessage({ id: 'productImport.close' })}
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleImport}
                disabled={loading || !hasData || dataRows === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    {intl.formatMessage({ id: 'productImport.importing' })}
                  </>
                ) : (
                  <>
                    <i className="pi pi-upload me-1"></i>
                    {intl.formatMessage({ id: 'productImport.import' })} ({dataRows} {intl.formatMessage({ id: 'productImport.rows' })})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductImportModal;
