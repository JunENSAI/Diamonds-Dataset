from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Body
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Optional
import pandas as pd
from io import BytesIO

# Import processing functions
import processing

app = FastAPI(title="Diamonds Analysis API")

# --- CORS Middleware (Allow React frontend to access) ---
from fastapi.middleware.cors import CORSMiddleware
origins = [
    "http://localhost:3000", # Default React dev server port
    "http://127.0.0.1:3000",
    # Add production frontend URL here if applicable
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --------------------------------------------------------

# Store scaled data from PCA for K-Means (again, not robust)
pca_scaled_data = None

@app.post("/upload")
async def upload_diamond_data(file: UploadFile = File(...)):
    """Uploads an Excel file (.xlsx) containing diamond data."""
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an .xlsx file.")
    contents = await file.read()
    success, message = processing.load_data(contents)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

@app.get("/data")
async def get_uploaded_data(rows: Optional[int] = Query(100, description="Number of rows to preview")):
    """Returns a preview of the uploaded data."""
    try:
        df = processing.get_data()
        # Limit rows for preview and convert to JSON serializable format
        return JSONResponse(content=df.head(rows).to_dict(orient='records'))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# --- Plotting Endpoints ---
@app.get("/plot/scatter")
async def get_scatter_plot(variable: str = Query(..., description="Categorical variable (cut, color, clarity)")):
    """Generates data for a scatter plot of price vs. a categorical variable."""
    try:
        plot_json = processing.generate_scatter_plot_data(variable)
        return JSONResponse(content=plot_json)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/plot/boxplot")
async def get_boxplot(variable: str = Query(..., description="Numerical variable")):
    """Generates data for a boxplot of a numerical variable."""
    try:
        plot_json = processing.generate_boxplot_data(variable)
        return JSONResponse(content=plot_json)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/plot/distribution")
async def get_distribution_plot(variable: str = Query(..., description="Numerical variable")):
    """Generates data for a distribution plot (histogram) of a numerical variable."""
    try:
        plot_json = processing.generate_distribution_plot_data(variable)
        return JSONResponse(content=plot_json)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/plot/correlation")
async def get_correlation_plot(variables: List[str] = Body(..., description="List of numerical variables")):
    """Generates data for a correlation matrix heatmap."""
    try:
        plot_json = processing.generate_correlation_plot_data(variables)
        return JSONResponse(content=plot_json)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# --- Prediction Endpoints ---
@app.get("/predict")
async def get_predictions(model_type: str = Query(..., description="Model type (linear, xgboost, randomforest)")):
    """Runs a prediction model and returns results."""
    try:
        if model_type == 'linear':
            results_df, r_squared = processing.run_linear_regression()
        elif model_type == 'xgboost':
            results_df, r_squared = processing.run_xgboost()
        elif model_type == 'randomforest':
            results_df, r_squared = processing.run_random_forest()
        else:
            raise HTTPException(status_code=400, detail="Invalid model type specified.")

        # Generate plot data for Predicted vs Actual
        fig = px.scatter(results_df, x='Predicted', y='Actual', color='Clarity',
                         title=f'{model_type.capitalize()} Model: Predicted vs Actual Prices',
                         labels={'Predicted': 'Predicted Price ($)', 'Actual': 'Actual Price ($)'})
        fig.update_layout(xaxis_tickformat='$,.0f', yaxis_tickformat='$,.0f')
        plot_json = fig.to_json()

        return {
            "r_squared": r_squared,
            "plot_json": plot_json,
            "predictions_preview": results_df.head(100).to_dict(orient='records') # Preview first 100
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/download/predictions")
async def download_prediction_results(model_type: str = Query(..., description="Model type (linear, xgboost, randomforest)")):
    """Downloads prediction results as an Excel file."""
    try:
        if model_type == 'linear':
            results_df, _ = processing.run_linear_regression()
        elif model_type == 'xgboost':
            results_df, _ = processing.run_xgboost()
        elif model_type == 'randomforest':
            results_df, _ = processing.run_random_forest()
        else:
            raise HTTPException(status_code=400, detail="Invalid model type specified.")

        # Create Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            results_df[['Actual', 'Predicted']].to_excel(writer, index=False, sheet_name='Predictions')
        output.seek(0)

        headers = {
            'Content-Disposition': f'attachment; filename=predictions_{model_type}.xlsx'
        }
        return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# --- Clustering Endpoints ---
@app.get("/cluster/pca")
async def get_pca_results():
    """Performs PCA and returns scree and contribution plot data."""
    global pca_scaled_data
    try:
        scree_data, contrib_data, scaled_data = processing.run_pca()
        pca_scaled_data = scaled_data # Store for K-Means
        return {
            "scree_plot": scree_data,
            "contribution_plot": contrib_data
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/cluster/kmeans")
async def get_kmeans_results():
    """Performs K-Means clustering using data scaled during PCA."""
    global pca_scaled_data
    if pca_scaled_data is None:
        raise HTTPException(status_code=400, detail="PCA must be run before K-Means to get scaled data.")
    try:
        elbow_data, cluster_plot_json, means_data = processing.run_kmeans(pca_scaled_data)
        return {
            "elbow_plot": elbow_data,
            "cluster_plot": cluster_plot_json,
            "cluster_means": means_data
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# --- Root Endpoint (Optional) ---
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Diamonds Analysis API!"}

# --- To run the server (from the 'backend' directory) ---
# uvicorn main:app --reload