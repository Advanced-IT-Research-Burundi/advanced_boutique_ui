import React from 'react'
import RapportHeader from './RapportHeader'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchApiData } from '../../stores/slicer/apiDataSlicer'
import { API_CONFIG } from '../../services/config'

function ReportCreditTvaScreen() {
    const { data, loading } = useSelector(state => state.apiData);
    const dispatch = useDispatch();
    
    useEffect(() => {
        loadCreditTva();
    }, [])

    const loadCreditTva = async () => {
        try {
            await dispatch(fetchApiData({url: API_CONFIG.ENDPOINTS.CREDIT_TVA_DETAILS, itemKey: 'creditTvaDetails'}));
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <>
            <RapportHeader />
            {JSON.stringify(data.creditTvaDetails)}
        </>
    )
}

export default ReportCreditTvaScreen