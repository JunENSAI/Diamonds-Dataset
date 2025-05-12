import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput, CircularProgress, Alert, Typography } from '@mui/material';
import FileUpload from '../components/FileUpload';
import DataTable from '../components/DataTable'; // Assume this component exists
import PlotComponent from '../components/PlotComponent';
import * as api from '../services/api';

const NUMERIC_VARS = ["carat", "depth", "table", "price", "x", "y", "z"];
const CATEGORICAL_VARS = ["cut", "color", "clarity"];

function DatasetExplorer() {
  const [tabValue, setTabValue] = useState(0);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [dataPreview, setDataPreview] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // State for plots
  const [selectedCategorical, setSelectedCategorical] = useState('cut');
  const [scatterPlotData, setScatterPlotData] = useState(null);
  const [loadingScatter, setLoadingScatter] = useState(false);
  const [scatterError, setScatterError] = useState('');

  const [selectedAberrant, setSelectedAberrant] = useState('price');
  const [boxPlotData, setBoxPlotData] = useState(null);
  const [loadingBox, setLoadingBox] = useState(false);
  const [boxError, setBoxError] = useState('');

  const [selectedDist, setSelectedDist] = useState('price');
  const [distPlotData, setDistPlotData] = useState(null);
  const [loadingDist, setLoadingDist] = useState(false);
  const [distError, setDistError] = useState('');

  const [selectedCorrVars, setSelectedCorrVars] = useState(['carat', 'price', 'depth', 'table']);
  const [corrPlotData, setCorrPlotData] = useState(null);
  const [loadingCorr, setLoadingCorr] = useState(false);
  const [corrError, setCorrError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUploadSuccess = async (success = true) => {
      setFileUploaded(success);
      if(success) {
         fetchDataPreview(); 
         setScatterPlotData(null);
         setBoxPlotData(null);
         setDistPlotData(null);
         setCorrPlotData(null);

         if (tabValue === 1) fetchScatterPlot(selectedCategorical);
         if (tabValue === 2) fetchBoxPlot(selectedAberrant);

      } else {
        setDataPreview([]);
      }
  };

   const fetchDataPreview = async () => {
    setLoadingData(true);
    setDataError('');
    try {
        const response = await api.getDataPreview(100); // Get 100 rows preview
        setDataPreview(response.data || []);
    } catch (err) {
        setDataError(err.response?.data?.detail || err.message || 'Failed to fetch data preview.');
        setDataPreview([]);
    } finally {
        setLoadingData(false);
    }
  };

  // --- Plot Fetching Functions ---
  const fetchScatterPlot = async (variable) => {
      if (!fileUploaded) { setScatterError("Upload data first."); return; }
      setLoadingScatter(true); setScatterError('');
      try {
          const response = await api.getScatterPlot(variable);
          setScatterPlotData(response.data);
      } catch (err) { setScatterError(err.response?.data?.detail || 'Failed to load scatter plot'); }
      finally { setLoadingScatter(false); }
  };

  const fetchBoxPlot = async (variable) => {
     if (!fileUploaded) { setBoxError("Upload data first."); return; }
      setLoadingBox(true); setBoxError('');
      try {
          const response = await api.getBoxPlot(variable);
          setBoxPlotData(response.data);
      } catch (err) { setBoxError(err.response?.data?.detail || 'Failed to load box plot'); }
      finally { setLoadingBox(false); }
  };

   const fetchDistPlot = async (variable) => {
     if (!fileUploaded) { setDistError("Upload data first."); return; }
      setLoadingDist(true); setDistError('');
      try {
          const response = await api.getDistributionPlot(variable);
          setDistPlotData(response.data);
      } catch (err) { setDistError(err.response?.data?.detail || 'Failed to load distribution plot'); }
      finally { setLoadingDist(false); }
  };

   const fetchCorrPlot = async (variables) => {
     if (!fileUploaded) { setCorrError("Upload data first."); return; }
     if (!variables || variables.length < 2) { setCorrError("Select at least two variables."); return; }
      setLoadingCorr(true); setCorrError('');
      try {
          const response = await api.getCorrelationPlot(variables);
          setCorrPlotData(response.data);
      } catch (err) { setCorrError(err.response?.data?.detail || 'Failed to load correlation plot'); }
      finally { setLoadingCorr(false); }
  };

  // --- Effects to load plots when inputs change ---
  useEffect(() => {
    if (fileUploaded && tabValue === 1) {
        fetchScatterPlot(selectedCategorical);
    }
  }, [selectedCategorical, fileUploaded, tabValue]);

  useEffect(() => {
    if (fileUploaded && tabValue === 2) {
        fetchBoxPlot(selectedAberrant);
    }
  }, [selectedAberrant, fileUploaded, tabValue]);

  useEffect(() => {
    if (fileUploaded && tabValue === 3) {
        fetchDistPlot(selectedDist);
    }
  }, [selectedDist, fileUploaded, tabValue]);

 useEffect(() => {
    if (fileUploaded && tabValue === 4) {
        fetchCorrPlot(selectedCorrVars);
    }
  }, [selectedCorrVars, fileUploaded, tabValue]);


  // --- Handlers for select changes ---
  const handleCategoricalChange = (event) => {
    setSelectedCategorical(event.target.value);
  };
  const handleAberrantChange = (event) => {
    setSelectedAberrant(event.target.value);
  };
   const handleDistChange = (event) => {
    setSelectedDist(event.target.value);
  };
  const handleCorrVarsChange = (event) => {
    const { target: { value } } = event;
    setSelectedCorrVars(typeof value === 'string' ? value.split(',') : value);
  };


  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="dataset explorer tabs">
        <Tab label="Import Data" />
        <Tab label="Categorical vs Price" disabled={!fileUploaded}/>
        <Tab label="Outliers (BoxPlot)" disabled={!fileUploaded}/>
        <Tab label="Distribution (Histogram)" disabled={!fileUploaded}/>
        <Tab label="Correlation Matrix" disabled={!fileUploaded}/>
      </Tabs>

      {/* Tab Panels */}
      <Box sx={{ p: 3 }}>
        {tabValue === 0 && (
          <>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            {loadingData && <CircularProgress sx={{mt: 2}}/>}
            {dataError && <Alert severity="error" sx={{mt: 2}}>{dataError}</Alert>}
            {fileUploaded && !loadingData && !dataError && (
              <Box sx={{mt: 2}}>
                <Typography variant="h6">Data Preview (First 100 Rows)</Typography>
                <DataTable data={dataPreview} />
              </Box>
            )}
          </>
        )}

        {tabValue === 1 && (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="cat-select-label">Categorical Variable</InputLabel>
              <Select
                labelId="cat-select-label"
                value={selectedCategorical}
                label="Categorical Variable"
                onChange={handleCategoricalChange}
              >
                {CATEGORICAL_VARS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <PlotComponent plotData={scatterPlotData} loading={loadingScatter} error={scatterError} title={`Price vs ${selectedCategorical}`}/>
          </>
        )}
         {tabValue === 2 && (
           <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="aberrant-select-label">Numeric Variable</InputLabel>
              <Select
                labelId="aberrant-select-label"
                value={selectedAberrant}
                label="Numeric Variable"
                onChange={handleAberrantChange}
              >
                 {NUMERIC_VARS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <PlotComponent plotData={boxPlotData} loading={loadingBox} error={boxError} title={`Box Plot for ${selectedAberrant}`}/>
           </>
        )}
        {tabValue === 3 && (
            <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="dist-select-label">Numeric Variable</InputLabel>
              <Select
                labelId="dist-select-label"
                value={selectedDist}
                label="Numeric Variable"
                onChange={handleDistChange}
              >
                 {NUMERIC_VARS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <PlotComponent plotData={distPlotData} loading={loadingDist} error={distError} title={`Distribution of ${selectedDist}`}/>
            </>
        )}
         {tabValue === 4 && (
           <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="corr-select-label">Numeric Variables</InputLabel>
               <Select
                labelId="corr-select-label"
                multiple
                value={selectedCorrVars}
                onChange={handleCorrVarsChange}
                input={<OutlinedInput label="Numeric Variables" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {NUMERIC_VARS.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={selectedCorrVars.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <PlotComponent plotData={corrPlotData} loading={loadingCorr} error={corrError} title="Correlation Matrix"/>
           </>
        )}
      </Box>
    </Box>
  );
}

export default DatasetExplorer;