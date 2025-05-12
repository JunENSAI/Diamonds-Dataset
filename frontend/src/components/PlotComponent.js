import React from 'react';
import Plot from 'react-plotly.js';
import { Box, Typography, CircularProgress } from '@mui/material';

function PlotComponent({ plotData, loading, error, title }) {
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{mt: 2}}>Error loading plot: {error}</Typography>;
  }

  // Check if plotData is the plotly JSON structure or the { data, layout } object
  let data, layout;
  if (plotData && plotData.data && plotData.layout) {
      data = plotData.data;
      layout = plotData.layout;
  } else {
      // If API returns just the fig JSON string, parse it (less ideal)
      try {
          const parsed = JSON.parse(plotData); // Assuming plotData is a JSON string from fig.to_json()
          data = parsed.data;
          layout = parsed.layout;
      } catch(e) {
           console.error("Error parsing plot data:", e);
           return <Typography color="error" sx={{mt: 2}}>Invalid plot data format.</Typography>;
      }
  }


  if (!data || !layout) {
    return <Typography sx={{mt: 2}}>{title ? title : 'Plot'}: No data available or invalid format.</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Plot
        data={data}
        layout={{ ...layout, title: title || layout.title, autosize: true }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }} // Adjust height as needed
        config={{ responsive: true }}
      />
    </Box>
  );
}

export default PlotComponent;