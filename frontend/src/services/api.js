import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Your FastAPI backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDataPreview = (rows = 100) => {
  return apiClient.get(`/data?rows=${rows}`);
};

export const getScatterPlot = (variable) => {
  return apiClient.get(`/plot/scatter?variable=${variable}`);
};

export const getBoxPlot = (variable) => {
    return apiClient.get(`/plot/boxplot?variable=${variable}`);
};

export const getDistributionPlot = (variable) => {
    return apiClient.get(`/plot/distribution?variable=${variable}`);
};

export const getCorrelationPlot = (variables) => {
    return apiClient.post('/plot/correlation', variables ); // Send variables in body
};

export const getPredictions = (modelType) => {
    return apiClient.get(`/predict?model_type=${modelType}`);
};

export const downloadPredictions = (modelType) => {
    return apiClient.get(`/download/predictions?model_type=${modelType}`, {
        responseType: 'blob', // Important for file download
    });
};

export const getPcaResults = () => {
    return apiClient.get('/cluster/pca');
};

export const getKmeansResults = () => {
    return apiClient.get('/cluster/kmeans');
};

// Add other API calls as needed

export default apiClient;