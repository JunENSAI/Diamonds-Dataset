import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'; // Import useLocation
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    AppBar, Toolbar, Typography, CssBaseline, IconButton
} from '@mui/material';
import {
    Info, Visibility, Dataset, CheckCircleOutline, AccountTree,
    Menu as MenuIcon, GitHub
} from '@mui/icons-material'; // Import icons

// Import Pages
import About from './pages/About';
import Overview from './pages/Overview';
import DatasetExplorer from './pages/DatasetExplorer';
import Predictions from './pages/Predictions';
import Clustering from './pages/Clustering';

const drawerWidth = 240;

const menuItems = [
  { text: 'A propos', icon: <Info />, path: '/' },
  { text: 'Aperçu', icon: <Visibility />, path: '/overview' },
  { text: 'Dataset', icon: <Dataset />, path: '/dataset' },
  { text: 'Predictions', icon: <CheckCircleOutline />, path: '/predictions' },
  { text: 'Clustering', icon: <AccountTree />, path: '/clustering' },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Custom hook or component to get the current path for highlighting
  const LocationAwareListItem = ({ item }) => {
      const location = useLocation();
      const isSelected = location.pathname === item.path;

      return (
          <ListItem key={item.text} disablePadding component={Link} to={item.path} sx={{
              color: 'inherit',
              textDecoration: 'none',
              backgroundColor: isSelected ? 'rgba(20,200,235,0.75)' : 'transparent',
               '&:hover': {
                   backgroundColor: !isSelected ? 'rgba(44,200,235,0.75)' : 'rgba(20,200,235,0.9)', 
               },
          }}>
            <ListItemButton selected={isSelected}>
              <ListItemIcon sx={{ color: isSelected ? 'black' : 'white' }}> {/* Adjust icon color */}
                  {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: isSelected ? 'black' : 'white' }}/> {/* Adjust text color */}
            </ListItemButton>
          </ListItem>
      );
  }


  const drawer = (
    <div>
      {/* Toolbar creates space for the AppBar */}
      <Toolbar sx={{backgroundColor: 'rgba(20,200,220,0.35)'}}>
          {/* Optional: Add a logo or title here if needed inside the drawer header */}
           <Typography variant="h6" sx={{color: 'rgb(20,20,100)'}}>Diamonds App</Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <LocationAwareListItem key={item.text} item={item} />
        ))}
      </List>
    </div>
  );

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            // Add AppBar styling similar to the R shiny theme header
            background: 'linear-gradient(to right, rgba(20,215,190,0.75), rgba(20,215,190,0.75))',
            boxShadow: '2px 3px 2px rgba(20,200,210,0.35)' // Added shadow
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }} // Only show on small screens
            >
              <MenuIcon />
            </IconButton>

             <Box sx={{ flexGrow: 1 }} />
             {/* External Links */}
             <IconButton sx={{color: 'rgb(25,120,130)'}} href="https://github.com/JunENSAI/Diamonds-Dataset.git" target="_blank" title="GitHub Repo">
                 <GitHub />
             </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="navigation menu"
        >
          {/* Temporary drawer for small screens */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    // Basic sidebar styling
                    background: 'linear-gradient(to bottom, rgb(25,120,130), rgb(25,120,145))',
                    color: 'white'
               },
            }}
          >
            {drawer}
          </Drawer>
          {/* Permanent drawer for larger screens */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    // Basic sidebar styling
                    background: 'linear-gradient(to bottom, rgb(25,120,130), rgb(25,120,145))', 
                    color: 'white' 
               },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              background: '#C6C6C6', 
              minHeight: '100vh'
            }}
        >
          <Toolbar /> {/* This Toolbar acts as a spacer below the fixed AppBar */}
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/dataset" element={<DatasetExplorer />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/clustering" element={<Clustering />} />
             <Route path="*" element={<About />} /> {/* Or a 404 page */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;