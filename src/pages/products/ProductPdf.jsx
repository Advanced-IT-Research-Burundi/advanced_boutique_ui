import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import './styles/ProductPdf.css'; // Fichier CSS séparé pour les styles d'impression
import ubwiza from "../../assets/logo/ubwiza.png"

const ProductPdf = () => {
    const { data } = useSelector(state => state.apiData);
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchApiData({ url: "/api/product/pdf", itemKey: 'products' }));
    },[]);
    
    const formatNumber = (value) => {
        const num = parseFloat(value.replace(/,/g, ''));
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };
    
    const getCurrentDate = () => {
        return new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    
    const handlePrint = () => {
        window.print();
    };
    
    let rowCount = 0;
    
    return (
        <div className="product-pdf-container">
        <div className="no-print">
        <button onClick={handlePrint} className="print-button">
        Imprimer
        </button>
        </div>
        
        <div className="printable-content">
        <div className="header">
        <img 
        className="header-img" 
        src={ubwiza} 
        alt="Header UBB" 
        />
        <div className="date-section">{getCurrentDate()}</div>
        </div>
        
        <div className="title">LISTE DES PRODUITS</div>
        
        <table>
        <thead>
        <tr>
        <th style={{ width: '15%' }}>Code article</th>
        <th style={{ width: '50%' }}>Nom article</th>
        <th style={{ width: '17.5%' }} className="text-right">PVHT</th>
        <th style={{ width: '17.5%' }} className="text-right">PVTTC</th>
        </tr>
        </thead>
        <tbody>
        {
                data && data.products && Object.entries(data.products).map(([categoryId, categoryProducts]) => {
                 const category = categoryId|| 'Sans catégorie';
                return (
                  <React.Fragment key={categoryId}>
                  <tr>
                    <td colSpan="4" className="category-row">
                      {category}
                    </td>
                        </tr>
                         {categoryProducts.map((product) => {
                    rowCount++;
                    return (
                      <tr 
                        key={product.code} 
                        className={rowCount % 2 === 0 ? 'striped' : ''}
                      >
                        <td>{product.code}</td>
                        <td>{product.name}</td>
                        <td className="text-right">
                          {  product?.sale_price_ht}
                        </td>
                        <td className="text-right">
                          {  product?.sale_price_ttc}
                        </td>
                      </tr>
                    );
                  })}
                 
                </React.Fragment>
                )
            })
        }
        
        
        </tbody>
        </table>
        </div>
        </div>
    );
};

export default ProductPdf;