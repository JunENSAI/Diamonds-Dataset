import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import r2_score
import xgboost as xgb
import plotly.graph_objects as go
import plotly.express as px
from io import BytesIO
import openpyxl # Required by pandas read_excel for xlsx

# --- Global variable for simplicity (NOT production-ready) ---
# In a real app, use caching, sessions, or temp files
uploaded_data = None
# -------------------------------------------------------------

# --- Data Loading ---
def load_data(file_stream):
    global uploaded_data
    try:
        # Use BytesIO to read the file stream
        data = pd.read_excel(BytesIO(file_stream), engine='openpyxl')
        # Basic validation
        required_cols = {'carat', 'cut', 'color', 'clarity', 'depth', 'table', 'price', 'x', 'y', 'z'}
        if not required_cols.issubset(data.columns):
            raise ValueError(f"Missing required columns. Found: {data.columns.tolist()}")
        uploaded_data = data
        return True, f"Successfully loaded {len(data)} rows."
    except Exception as e:
        uploaded_data = None
        return False, f"Error loading data: {str(e)}"

def get_data():
    if uploaded_data is None:
        raise ValueError("No data loaded yet.")
    return uploaded_data

# --- Plotting Data Generation ---

def generate_scatter_plot_data(variable):
    df = get_data()
    if variable not in ['cut', 'color', 'clarity']:
        raise ValueError("Invalid categorical variable for scatter plot.")
    if 'price' not in df.columns:
         raise ValueError("Dataset missing 'price' column.")

    # Prepare data for Plotly
    plot_data = df[['price', variable]].copy()
    plot_data[variable] = plot_data[variable].astype(str) # Ensure categorical

    fig = px.scatter(plot_data, x='price', y=variable, color=variable,
                     title=f"Price vs {variable.capitalize()}",
                     labels={'price': 'Price ($)', variable: variable.capitalize()})
    fig.update_layout(xaxis_tickformat='$,.0f')
    return fig.to_json() # Return Plotly JSON spec

def generate_boxplot_data(variable):
    df = get_data()
    numeric_vars = ['carat', 'depth', 'table', 'price', 'x', 'y', 'z']
    if variable not in numeric_vars:
        raise ValueError("Invalid numerical variable for boxplot.")

    fig = px.box(df, y=variable, title=f"Boxplot for {variable.capitalize()}",
                 labels={'y': variable.capitalize()})
    return fig.to_json()

def generate_distribution_plot_data(variable):
    df = get_data()
    numeric_vars = ['carat', 'depth', 'table', 'price', 'x', 'y', 'z']
    if variable not in numeric_vars:
        raise ValueError("Invalid numerical variable for distribution plot.")

    # Using plotly express for histogram with density overlay requires scipy
    fig = px.histogram(df, x=variable, marginal="rug", # or "box"
                       title=f"Distribution of {variable.capitalize()}",
                       labels={'x': variable.capitalize()},
                       opacity=0.7) # Cannot directly overlay density easily like ggplot

    # Alternative: Just histogram data
    # counts, bins = np.histogram(df[variable].dropna(), bins=30)
    # bin_centers = 0.5 * (bins[1:] + bins[:-1])
    # fig_data = {
    #     'data': [{'x': bin_centers.tolist(), 'y': counts.tolist(), 'type': 'bar', 'name': 'Histogram'}],
    #     'layout': {'title': f'Distribution of {variable}', 'xaxis': {'title': variable}, 'yaxis': {'title': 'Frequency'}}
    # }
    # return fig_data

    return fig.to_json()


def generate_correlation_plot_data(numeric_vars):
    df = get_data()
    if not numeric_vars:
        raise ValueError("No numeric variables selected.")

    valid_vars = [var for var in numeric_vars if var in df.columns and pd.api.types.is_numeric_dtype(df[var])]
    if not valid_vars:
         raise ValueError("None of the selected variables are numeric or present in the data.")

    corr_matrix = df[valid_vars].corr()

    # Create heatmap using Plotly
    fig = go.Figure(data=go.Heatmap(
                   z=corr_matrix.values,
                   x=corr_matrix.columns,
                   y=corr_matrix.columns,
                   hoverongaps = False,
                   colorscale='RdBu', # Similar to RColorBrewer's RdBu
                   zmin=-1, zmax=1))
    fig.update_layout(title='Correlation Matrix')
    return fig.to_json()

# --- Prediction Models ---
def get_prediction_features(df):
    # Consistent features for simpler comparison, as used in R example's RF/XGBoost
    # Note: R's lm(price ~ .) would include categoricals requiring encoding here
    features = ['carat', 'table', 'x', 'y', 'z', 'depth']
    missing_features = [f for f in features if f not in df.columns]
    if missing_features:
        raise ValueError(f"Dataset missing required feature columns for prediction: {missing_features}")

    X = df[features].copy()

    # Basic check for non-numeric data or NaNs - replace with 0 for simplicity
    for col in features:
        X[col] = pd.to_numeric(X[col], errors='coerce')
    X = X.fillna(0)

    if 'price' not in df.columns:
        raise ValueError("Dataset missing 'price' column for prediction.")
    y = df['price'].copy()
    y = pd.to_numeric(y, errors='coerce').fillna(0)

    return X, y, df['clarity'].astype(str) # Include clarity for plot coloring

def run_linear_regression():
    df = get_data()
    X, y, clarity_for_plot = get_prediction_features(df)

    model = LinearRegression()
    model.fit(X, y)
    y_pred = model.predict(X)
    r_squared = r2_score(y, y_pred) # Or model.score(X, y)

    results = pd.DataFrame({'Actual': y, 'Predicted': y_pred, 'Clarity': clarity_for_plot})
    return results, r_squared

def run_xgboost():
    df = get_data()
    X, y, clarity_for_plot = get_prediction_features(df)

    # XGBoost handles NaNs internally if needed, but we filled them above
    model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, random_state=42) # n_estimators similar to nrounds
    # Note: R code used nrounds=390, which might be excessive without early stopping
    model.fit(X, y)
    y_pred = model.predict(X)
    r_squared = r2_score(y, y_pred)

    results = pd.DataFrame({'Actual': y, 'Predicted': y_pred, 'Clarity': clarity_for_plot})
    return results, r_squared

def run_random_forest():
    df = get_data()
    X, y, clarity_for_plot = get_prediction_features(df)

    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1) # n_estimators similar to ntree=10 is too low, using 100
    # Note: R code used ntree=10, typically too small for good performance
    model.fit(X, y)
    y_pred = model.predict(X)
    r_squared = r2_score(y, y_pred)

    results = pd.DataFrame({'Actual': y, 'Predicted': y_pred, 'Clarity': clarity_for_plot})
    return results, r_squared

# --- Clustering ---
def run_pca():
    df_orig = get_data()
    # Prepare data: select numeric, handle categoricals (convert to int as in R example), scale
    # Using only numeric for simplicity here, matching R approach would need explicit factor->int conversion
    df_numeric = df_orig.select_dtypes(include=np.number).copy()
    if 'price' in df_numeric.columns: # Exclude target variable if present
        df_numeric = df_numeric.drop(columns=['price'])

    if df_numeric.empty:
        raise ValueError("No numeric columns found for PCA after excluding 'price'.")

    df_numeric = df_numeric.dropna()

    # Sample if dataset is large (as in R example 0.4%)
    sample_frac = 0.1 # Use 10% for potentially better results than 0.4%
    if len(df_numeric) > 5000: # Only sample if large
        df_subset = df_numeric.sample(frac=sample_frac, random_state=42)
    else:
        df_subset = df_numeric

    if df_subset.empty:
         raise ValueError("Not enough data points after sampling/dropna for PCA.")

    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df_subset)

    pca = PCA(n_components=min(10, scaled_data.shape[1])) # Limit components
    pca.fit(scaled_data)

    explained_variance_ratio = pca.explained_variance_ratio_
    components = pca.components_
    feature_names = df_subset.columns

    # Scree plot data
    scree_data = {'data': [{'x': list(range(1, len(explained_variance_ratio) + 1)),
                           'y': explained_variance_ratio.tolist(),
                           'type': 'bar', 'name': 'Explained Variance'},
                           {'x': list(range(1, len(explained_variance_ratio) + 1)),
                            'y': np.cumsum(explained_variance_ratio).tolist(),
                            'type': 'scatter', 'mode': 'lines+markers', 'name': 'Cumulative Variance', 'yaxis': 'y2'}],
                  'layout': {'title': 'PCA Scree Plot', 'xaxis': {'title': 'Principal Component'},
                             'yaxis': {'title': 'Explained Variance Ratio'},
                             'yaxis2': {'title': 'Cumulative Variance', 'overlaying': 'y', 'side': 'right'}}}

    # Contribution plot data (simplified: absolute value of component loadings for first 2 PCs)
    # A more accurate contribution often involves squaring loadings
    loadings = pd.DataFrame(np.abs(components[:2, :].T), columns=['PC1', 'PC2'], index=feature_names)
    loadings_sum = loadings.sum(axis=1) # Sum across PC1 and PC2
    contributions = loadings_sum / loadings_sum.sum() * 100 # Contribution to variance explained by PC1+PC2

    contrib_data = {'data': [{'x': contributions.index.tolist(),
                             'y': contributions.values.tolist(),
                             'type': 'bar'}],
                    'layout': {'title': 'Feature Contribution to PC1 & PC2 (Absolute Loadings)',
                               'xaxis': {'title': 'Feature'},
                               'yaxis': {'title': 'Contribution (%)'}}}


    return scree_data, contrib_data, scaled_data # Pass scaled data for K-Means


def run_kmeans(scaled_data):
     # Determine optimal k using Elbow method (simplified)
    # Note: R example uses fviz_nbclust which is more sophisticated
    sse = []
    k_range = range(1, 11)
    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(scaled_data)
        sse.append(kmeans.inertia_) # Sum of squared distances

    elbow_data = {'data': [{'x': list(k_range), 'y': sse, 'type': 'scatter', 'mode': 'lines+markers'}],
                  'layout': {'title': 'Elbow Method for Optimal K',
                             'xaxis': {'title': 'Number of Clusters (K)'},
                             'yaxis': {'title': 'Sum of Squared Errors (SSE)'}}}

    # Use k=3 based on R example's finding, or choose from elbow plot visually
    optimal_k = 3
    kmeans_final = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
    clusters = kmeans_final.fit_predict(scaled_data)

    # Reduce dimensionality for plotting clusters (use PCA results)
    pca = PCA(n_components=2)
    principal_components = pca.fit_transform(scaled_data)
    pc_df = pd.DataFrame(data=principal_components, columns=['PC1', 'PC2'])
    pc_df['Cluster'] = clusters.astype(str) # Convert cluster numbers to strings for categorical coloring

    cluster_plot = px.scatter(pc_df, x='PC1', y='PC2', color='Cluster',
                              title=f'K-Means Clustering Results (k={optimal_k}) visualized on PC1/PC2')

    # Calculate cluster means (inverse transform scaled data - optional, or show means of scaled data)
    # Showing means on the *original* sampled data corresponding to the clusters
    df_orig = get_data()
    df_numeric = df_orig.select_dtypes(include=np.number).copy()
    if 'price' in df_numeric.columns:
        df_numeric = df_numeric.drop(columns=['price'])
    df_numeric = df_numeric.dropna()

    sample_frac = 0.1
    if len(df_numeric) > 5000:
        df_subset = df_numeric.sample(frac=sample_frac, random_state=42)
    else:
        df_subset = df_numeric

    if len(df_subset) == len(clusters): # Check alignment before adding cluster column
        df_subset['cluster'] = clusters
        cluster_means = df_subset.groupby('cluster').mean().reset_index()
    else:
        # Fallback if lengths don't match (e.g., due to NaNs handled differently)
         cluster_means = pd.DataFrame({'cluster': list(range(optimal_k)), 'Error': ['Could not calculate means'] * optimal_k})


    return elbow_data, cluster_plot.to_json(), cluster_means.to_dict(orient='records')