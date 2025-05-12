import React, { useState, useEffect } from 'react';
import {
    Box, Tabs, Tab, Select, MenuItem, InputLabel, FormControl, Button,
    Typography, CircularProgress, Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PlotComponent from '../components/PlotComponent';
import DataTable from '../components/DataTable';
import * as api from '../services/api';
import { saveAs } from 'file-saver'; 

const MODEL_TYPES = [
    { value: 'linear', label: 'Régression Linéaire' },
    { value: 'xgboost', label: 'XGBoost' },
    { value: 'randomforest', label: 'Random Forest' }
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`prediction-tabpanel-${index}`}
      aria-labelledby={`prediction-tab-${index}`}
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


function Predictions() {
    const [tabValue, setTabValue] = useState(0);
    const [selectedModel, setSelectedModel] = useState('xgboost'); // Default model
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');
    const [showDataUploadedMessage, setShowDataUploadedMessage] = useState(false); 

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 1 && !predictionData) {
            fetchPredictions(selectedModel);
        }
    };

    const handleModelChange = (event) => {
        setSelectedModel(event.target.value);
        setPredictionData(null); 
        setError('');
        setDownloadError('');
        if (tabValue === 0) {
           fetchPredictions(event.target.value);
        } else if (tabValue === 1) {
             fetchPredictions(event.target.value);
        }
    };

    const fetchPredictions = async (modelType) => {
        setLoading(true);
        setError('');
        setShowDataUploadedMessage(false);
        try {
            const response = await api.getPredictions(modelType);
            setPredictionData(response.data);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch predictions.';
             if (errorMsg.includes("No data loaded yet") || errorMsg.includes("Dataset missing")) {
                setShowDataUploadedMessage(true);
                setError("Veuillez d'abord importer les données dans l'onglet 'Dataset'.");
            } else {
                 setError(errorMsg);
            }
            setPredictionData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        setDownloading(true);
        setDownloadError('');
        try {
            const response = await api.downloadPredictions(selectedModel);
            // Use file-saver to save the blob
            saveAs(response.data, `predictions_${selectedModel}.xlsx`);
        } catch (err) {
             const errorMsg = err.response?.data?.detail || err.message || 'Failed to download predictions.';
             if (errorMsg.includes("No data loaded yet") || errorMsg.includes("Dataset missing")) {
                setDownloadError("Veuillez d'abord importer les données et exécuter une prédiction.");
            } else {
                setDownloadError(errorMsg);
            }
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        if (tabValue === 0) {
             fetchPredictions(selectedModel);
        }
    }, [selectedModel, tabValue]); 


    const renderPredictionContent = () => (
        <>
         {error && !showDataUploadedMessage && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
         {showDataUploadedMessage && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}><CircularProgress /></Box>}
          {predictionData && !loading && !error && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Résultats pour: {MODEL_TYPES.find(m => m.value === selectedModel)?.label || selectedModel}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Score R²: {predictionData.r_squared ? predictionData.r_squared.toFixed(4) : 'N/A'}
                    </Typography>
                    <PlotComponent
                        plotData={predictionData.plot_json}
                        loading={false}
                        error={null} 
                        title={`Prédictions vs Réalité (Couleur par Clarté)`}
                    />
                </Box>
            )}
        </>
    );

    return (
        <Box sx={{ width: '100%' }}>
            <FormControl sx={{ m: 1, minWidth: 200, mb: 3 }}>
                <InputLabel id="model-select-label">Méthode de Prédiction</InputLabel>
                <Select
                    labelId="model-select-label"
                    value={selectedModel}
                    label="Méthode de Prédiction"
                    onChange={handleModelChange}
                    disabled={loading || downloading}
                >
                    {MODEL_TYPES.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                </Select>
            </FormControl>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="prediction tabs">
                    <Tab label="Graphique Prédictions" id="prediction-tab-0" aria-controls="prediction-tabpanel-0"/>
                    <Tab label="Télécharger & Aperçu" id="prediction-tab-1" aria-controls="prediction-tabpanel-1" disabled={!predictionData && !showDataUploadedMessage} />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
               {renderPredictionContent()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                 <Typography variant="h6" gutterBottom>Télécharger les Résultats</Typography>
                 <Button
                    variant="contained"
                    onClick={handleDownload}
                    disabled={downloading || loading || !predictionData}
                    startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
                    sx={{ mb: 2 }}
                >
                    {downloading ? 'Téléchargement...' : `Réels vs Prédictions (${MODEL_TYPES.find(m => m.value === selectedModel)?.label})`}
                </Button>
                 {downloadError && <Alert severity="error" sx={{ mb: 2 }}>{downloadError}</Alert>}
                 {showDataUploadedMessage && !predictionData && <Alert severity="warning" sx={{ mb: 2 }}>Veuillez d'abord importer les données dans l'onglet 'Dataset' et choisir un modèle.</Alert>}

                {predictionData && predictionData.predictions_preview && (
                    <Box sx={{mt: 2}}>
                         <Typography variant="h6" gutterBottom>Aperçu des Prédictions (100 premières lignes)</Typography>
                        <DataTable data={predictionData.predictions_preview} />
                    </Box>
                )}

            </TabPanel>
        </Box>
    );
}

export default Predictions;