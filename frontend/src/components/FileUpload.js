import React, { useState, useCallback } from 'react';
import { Button, Input, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { uploadFile } from '../services/api';

function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await uploadFile(selectedFile);
      setSuccess(response.data.message || 'File uploaded successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(); 
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed.');
       if (onUploadSuccess) {
        onUploadSuccess(false); 
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2, p: 2, border: '1px dashed grey' }}>
      <Typography variant="h6" gutterBottom>Import Dataset Diamonds (.xlsx)</Typography>
      <Input
        type="file"
        onChange={handleFileChange}
        accept=".xlsx"
        disableUnderline
        sx={{ mb: 1 }}
      />
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={loading || !selectedFile}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
}

export default FileUpload;