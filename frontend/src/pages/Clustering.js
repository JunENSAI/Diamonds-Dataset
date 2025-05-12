import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Button, Typography, CircularProgress, Alert } from '@mui/material';
import PlotComponent from '../components/PlotComponent';
import DataTable from '../components/DataTable';
import * as api from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`clustering-tabpanel-${index}`}
      aria-labelledby={`clustering-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Clustering() {
  const [tabValue, setTabValue] = useState(0);

  // PCA State
  const [pcaData, setPcaData] = useState(null);
  const [loadingPca, setLoadingPca] = useState(false);
  const [errorPca, setErrorPca] = useState('');
  const [pcaRun, setPcaRun] = useState(false); // Track if PCA has been successfully run

  // KMeans State
  const [kmeansData, setKmeansData] = useState(null);
  const [loadingKmeans, setLoadingKmeans] = useState(false);
  const [errorKmeans, setErrorKmeans] = useState('');


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchPca = async () => {
    setLoadingPca(true);
    setErrorPca('');
    setPcaRun(false);
    setPcaData(null);
    setKmeansData(null); // Reset K-Means if PCA is re-run
    try {
      const response = await api.getPcaResults();
      setPcaData(response.data);
      setPcaRun(true); // Mark PCA as successfully run
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch PCA results.';
       if (errorMsg.includes("No data loaded yet")) {
            setErrorPca("Veuillez d'abord importer les données dans l'onglet 'Dataset'.");
       } else {
           setErrorPca(errorMsg);
       }
       setPcaRun(false);
    } finally {
      setLoadingPca(false);
    }
  };

  const fetchKmeans = async () => {
    if (!pcaRun) {
        setErrorKmeans("Veuillez d'abord exécuter l'ACP avec succès.");
        return;
    }
    setLoadingKmeans(true);
    setErrorKmeans('');
    try {
      const response = await api.getKmeansResults();
      setKmeansData(response.data);
    } catch (err) {
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch K-Means results.';
        if (errorMsg.includes("PCA must be run")) {
             setErrorKmeans("Erreur interne: L'ACP doit être exécutée avant K-Means (l'API devrait le savoir). Réessayez l'ACP.");
        } else {
            setErrorKmeans(errorMsg);
        }
    } finally {
      setLoadingKmeans(false);
    }
  };

  // Optional: Fetch PCA automatically on component mount if needed,
  // but a button click is often better for resource-intensive tasks.
  // useEffect(() => {
  //   fetchPca();
  // }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="clustering tabs">
          <Tab label="Réduction Dimension (ACP)" id="clustering-tab-0" aria-controls="clustering-tabpanel-0"/>
          <Tab label="K-Means Clustering" id="clustering-tab-1" aria-controls="clustering-tabpanel-1" disabled={!pcaRun} />
        </Tabs>
      </Box>

      {/* PCA Panel */}
      <TabPanel value={tabValue} index={0}>
        <Button onClick={fetchPca} variant="contained" disabled={loadingPca} sx={{ mb: 2 }}>
          {loadingPca ? <CircularProgress size={24} /> : "Exécuter l'ACP"}
        </Button>
        {errorPca && <Alert severity={errorPca.includes("Veuillez d'abord importer") ? "warning" : "error"} sx={{ mb: 2 }}>{errorPca}</Alert>}
        {pcaData && (
          <>
            <Typography variant="h6" gutterBottom>Variance Expliquée (Scree Plot)</Typography>
            <PlotComponent plotData={pcaData.scree_plot} loading={false} error={null} title="Scree Plot ACP" />
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Contribution des Variables (PC1 & PC2)</Typography>
            <PlotComponent plotData={pcaData.contribution_plot} loading={false} error={null} title="Contribution Plot ACP" />
            <Alert severity="info" sx={{mt: 2}}>L'ACP a été exécutée avec succès. Vous pouvez maintenant passer à l'onglet K-Means.</Alert>
          </>
        )}
      </TabPanel>

      {/* KMeans Panel */}
      <TabPanel value={tabValue} index={1}>
        <Button onClick={fetchKmeans} variant="contained" disabled={loadingKmeans || !pcaRun} sx={{ mb: 2 }}>
          {loadingKmeans ? <CircularProgress size={24} /> : "Exécuter K-Means (k=3)"}
        </Button>
        {!pcaRun && <Alert severity="warning" sx={{mb: 2}}>Exécutez d'abord l'ACP.</Alert>}
        {errorKmeans && <Alert severity="error" sx={{ mb: 2 }}>{errorKmeans}</Alert>}
        {kmeansData && (
          <>
            <Typography variant="h6" gutterBottom>Méthode du Coude (Elbow Method)</Typography>
            <PlotComponent plotData={kmeansData.elbow_plot} loading={false} error={null} title="Elbow Plot (pour info)" />

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Visualisation des Clusters (sur PC1/PC2)</Typography>
            <PlotComponent plotData={kmeansData.cluster_plot} loading={false} error={null} title="Clusters K-Means" />

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Moyennes par Cluster</Typography>
            <DataTable data={kmeansData.cluster_means} isLoading={false} error={null} />
          </>
        )}
      </TabPanel>
    </Box>
  );
}

export default Clustering;