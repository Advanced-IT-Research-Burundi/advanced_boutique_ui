import React from 'react'
import ImportHeader from './ImportHeader.jsx';
import logo from '../../assets/logo/ubwiza.png';
import usePrint from '../../hooks/usePrint.js';
import useFormat from '../../hooks/useFormat.js';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { API_CONFIG } from '../../services/config.js';
import { useEffect } from 'react';


const thStyle = {
    border: '1px solid #000',
    padding: '8px',
    backgroundColor: '#f2f2f2',
    textAlign: 'center',
};

const tdStyle = {
    border: '1px solid #000',
    padding: '1px',
    textAlign: 'right',
};

const textLeft = {
    ...tdStyle,
    textAlign: 'left',
}

const textRight = {
    ...tdStyle,
    textAlign: 'right',
    
}

const textCenter = {
    ...tdStyle,
    textAlign: 'center',
}

function BonEntreShowScreen() {
    const { id } = useParams();
    const itemKey = 'commande'+id;
    
    const dispatch = useDispatch();
    const { data } = useSelector(state => ({
        data: state.apiData?.data[itemKey]
    }));
    
    const {print} = usePrint();
    const { formatNumber, formatDate } = useFormat();
    
    useEffect(() => {
        initData();
    }, [])


    const  initData = async () => {
       await dispatch(fetchApiData({
            url: `${API_CONFIG.ENDPOINTS.COMMANDES}/${id}`,
            itemKey: itemKey,
            params: { id }
        }));
    }
    
    const totalDepense = data?.depenses?.reduce((total, depense) => total + (Number(depense?.amount) || 0), 0) || 0;
    const exchangeRate = Number(data?.exchange_rate) || 1;

    const detailsData = data?.details;
    
    // TOTAL PRIX D'ACHAT
    const totalPrixAchat = detailsData?.reduce((total, detail) => total + (Number(detail?.total_pa) || 0), 0) || 0;
    const totalPrixAchatV = detailsData?.reduce((total, detail) => total + (Number(detail?.total_pv) || 0), 0) || 0;

    const totalRevient = totalPrixAchat + totalDepense;
    const totalBenefice = totalPrixAchatV - totalRevient;
    
    return (
        <div>
        <ImportHeader />
        <div>
        <button onClick={() => print('commande')}>Imprimer</button>
        </div>
        <div id='commande'>
        <div className="header" style={{display: 'flex', justifyContent: 'space-between'}}>
        <div className="img"> 
        <img src={logo} alt="" style={{width: '300px'}} />
        </div>
        <div>
        <h6>{formatDate(data?.created_at)}</h6>
        </div>
        </div>
        
        <div>
        <h4 style={{textAlign: 'center'}}>
            BON D'ENTREE N° { (data?.id + "").padStart(4, "0")}/{data?.created_at?.split('T')[0].split('-')[0]}</h4>
                </div>
                
                <div>
                    <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #000'}}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Code</th>
                                <th style={thStyle}>Libellé</th>
                                <th style={thStyle}>P.A</th>
                                <th style={thStyle}>Taux de Change</th>
                                <th style={thStyle}>Qté</th>
                                <th style={thStyle}>P.V</th>
                                <th style={thStyle}> Total P.A</th>
                                <th style={thStyle}> Total P.V</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                
                            </tr>
                           { detailsData && detailsData?.map((item, index) => (
                               <tr key={index}>
                                   <td style={textLeft}>{item?.code}</td>
                                   <td style={textLeft}>{item?.libelle}</td>
                                   <td style={textRight}>{formatNumber(item?.pu)}</td>
                                   <td style={textRight}>{formatNumber(item?.cours || exchangeRate)}</td>
                                   <td style={textRight}>{formatNumber(item?.qte)}</td>
                                   <td style={textRight}>{formatNumber(item?.prix_vente)}</td>
                                   <td style={textRight}>{formatNumber(item?.total_pa)}</td>
                                   <td style={textRight}>{formatNumber(item?.total_pv)}</td>
                               </tr>
                           ))}
                          
                            <tr>
                                <th  colSpan={6}>Total</th>
                                <td style={textCenter}>{formatNumber(totalPrixAchat)}</td>
                                <td style={textCenter}>{formatNumber(totalPrixAchatV)}</td>
                            </tr>
                    
                        </tbody>
                    </table>
                    <br />
                    
                    <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #000'}}>
                        <thead>
                            <th>Dépenses</th>
                            <th>Montant</th>
                        </thead>
                        <tbody>
                            
                         
                            {data?.depenses?.map((item, index) => (
                                <tr key={index}>
                                    <td style={textLeft} >{item?.libelle}</td>
                                    <td style={textRight}>{formatNumber(item?.amount)}</td>
                                </tr>
                            ))}
                            <tr>
                                <td ></td>
                                <td style={textRight}>
                                    {formatNumber(totalDepense)}
                                </td>
                            </tr>

                        </tbody>
                    </table>
                    <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #000'}}>
                           
                            <tr>
                                <th>PRIX DE REVIENT TOTAL</th>
                                <td style={textRight}>{formatNumber(totalRevient)}</td>
                            </tr>
                            <tr>
                                <th>PRIX DE VENTE TOTAL</th>
                                <td style={textRight}>{formatNumber(totalPrixAchatV)}</td>
                            </tr>
                            <tr>
                                <th>BENEFICE</th>
                                <td style={textRight}>{formatNumber(totalPrixAchatV - totalRevient)}</td>
                            </tr>
                    </table>
                </div>
        </div>
        
        </div>
    )
}

export default BonEntreShowScreen