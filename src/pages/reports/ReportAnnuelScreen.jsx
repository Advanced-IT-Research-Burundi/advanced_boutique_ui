import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchApiData } from '../../stores/slicer/apiDataSlicer'
import RapportHeader from './RapportHeader'

import useFormat from '../../hooks/useFormat'
import usePrint from '../../hooks/usePrint'

function ReportAnnuelScreen() {
    const [annee, setAnnee] = useState(new Date().getFullYear())
    const { data } = useSelector((state) => (
        {
            data : state.apiData?.data?.RAPPORT_ANNUEL
        }
    ))
    const dispatch = useDispatch()
    const {formatDate, formatNumber} = useFormat()
    const {print, generatePdf} = usePrint()

    useEffect(() => {
        dispatch(fetchApiData({
            url : '/api/reports/depense_annuel',
            itemKey : 'RAPPORT_ANNUEL',
            params : {
                report_type : 'financial',
                start_date : new Date(annee, 0, 1).toISOString().split('T')[0],
                end_date : new Date(annee, 11, 31).toISOString().split('T')[0]
            }
        }))
    }, [annee])

    // Styles CSS pour l'impression et les couleurs alternées
    const printStyles = `
        @media print {
            .no-print {
                display: none !important;
            }
            
            .card {
                box-shadow: none !important;
                border: none !important;
            }
            
            body {
                margin: 0;
                padding: 0;
            }
            
            #rapport-annuel {
                margin: 0;
                padding: 0;
            }
            
            .print-table {
                page-break-inside: auto;
            }
            
            .print-table tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            
            .print-table thead {
                display: table-header-group;
            }
            
            .print-table tbody {
                display: table-row-group;
            }
        }
        
        .print-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #333;
            font-size: 12px;
        }
        
        .print-table th,
        .print-table td {
            border: 1px solid #666;
            padding: 8px;
            text-align: left;
            vertical-align: middle;
        }
        
        .print-table th {
            background-color: #4a5568;
            color: white;
            font-weight: bold;
            text-align: center;
        }
        
        .print-table tbody tr:nth-child(odd) {
            background-color: #f7fafc;
        }
        
        .print-table tbody tr:nth-child(even) {
            background-color: #edf2f7;
        }
        
        .print-table tbody tr:hover {
            background-color: #e2e8f0;
        }
        
        .total-row {
            background-color: #266de7ff !important;
            color: white !important;
            font-weight: bold;
        }
        
        .total-row td {
            border-top: 3px solid #333;
        }
        
        .print-buttons {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
        }
        
        .print-buttons button {
            margin-right: 10px;
        }
        
        @media print {
            .print-table tbody tr:nth-child(odd) {
                background-color: #f0f0f0 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .print-table tbody tr:nth-child(even) {
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .print-table th {
                background-color: #333333 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .total-row {
                background-color: #333333 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    `;

    return (
        <div>
            
            
            <div className="no-print">
                <RapportHeader />
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Rapport Annuel</h5>
                                <p className="card-text">Rapport Annuel pour l'année {annee}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="print-buttons">
                    <button className="btn btn-primary" onClick={() => print('rapport-annuel')}>
                        📄 Imprimer
                    </button>
                    <button className="btn btn-secondary" onClick={() => generatePdf('rapport-annuel')}>
                        📑 Générer PDF
                    </button>
                </div>
            </div>

            <div id="rapport-annuel">
            <style>{printStyles}</style>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
                        RAPPORT ANNUEL - {annee}
                    </h2>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                        Généré le {formatDate(new Date())}
                    </p>
                </div>

                <table className="print-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Numéro</th>
                            <th>Fournisseur</th>
                            <th>Transport</th>
                            <th>Douane</th>
                            <th>Licence</th>
                            <th>Assurance</th>
                            <th>Imprévu</th>
                            <th>BBN</th>
                            <th>Déchargement</th>
                            <th>Palette</th>
                        </tr>
                    </thead>

                    <tbody>

                        {data?.rows?.map((row, index) => (
                            <tr key={index}>
                                <td>{row.date}</td>
                                <td>{row.numero}</td>
                                <td>{formatNumber(row.fournisseur)}</td>
                                <td>{formatNumber(row.transport)}</td>
                                <td>{formatNumber(row.dedouanement)}</td>
                                <td>{formatNumber(row.licence)}</td>
                                <td>{formatNumber(row.assurance)}</td>
                                <td>{formatNumber(row.imprevu)}</td>
                                <td>{formatNumber(row.bbn)}</td>
                                <td>{formatNumber(row.dechargement)}</td>
                                <td>{formatNumber(row.palettes)}</td>
                            </tr>
                        ))}
                        {data?.totals && (
                            <tr className="total-row">
                                <td>{data?.totals.date}</td>
                                <td></td>
                                <td>{formatNumber(data?.totals.fournisseur)}</td>
                                <td>{formatNumber(data?.totals.transport)}</td>
                                <td>{formatNumber(data?.totals.dedouanement)}</td>
                                <td>{formatNumber(data?.totals.licence)}</td>
                                <td>{formatNumber(data.totals.assurance)}</td>
                                <td>{formatNumber(data.totals.imprevu)}</td>
                                <td>{formatNumber(data.totals.bbn)}</td>
                                <td>{formatNumber(data.totals.dechargement)}</td>
                                <td>{formatNumber(data.totals.palettes)}</td>
                            </tr>
                        )}
                        
                        
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ReportAnnuelScreen