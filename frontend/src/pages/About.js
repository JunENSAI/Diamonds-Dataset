import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

function About() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom component="h2" align="center" sx={{ fontWeight: 'bold', color: '#000000' }}>
        BD Diamonds
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: "'Arial', serif", lineHeight: 1.6, fontSize: '1.1rem', mt: 3 }}>
        La base de donnée 'Diamonds' disponible dans la librairie ggplot2 de R contient 53940 lignes et 10 colonnes.
        Voici quelques informations sur chaque colonne :
      </Typography>
      <List sx={{ fontFamily: "'Arial', serif", lineHeight: 1.6, fontSize: '1.1rem' }}>
        <ListItem disablePadding>
          <ListItemText primary="Carat : le poids (0.2 - 5.01)" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="Cut : la qualité de la coupe (Fair, Good, Very Good, Premium, Ideal)" />
        </ListItem>
         <ListItem disablePadding>
          <ListItemText primary="Color : la couleur, de J (pire) à D (meilleure)" />
        </ListItem>
         <ListItem disablePadding>
          <ListItemText primary="Clarity : la clarté, de I1 (pire) à IF (meilleure)" />
        </ListItem>
         <ListItem disablePadding>
          <ListItemText primary="Depth : pourcentage de la profondeur totale (43 - 79)" />
        </ListItem>
         <ListItem disablePadding>
          <ListItemText primary="Table : largeur de la table par rapport au point le plus large (43 - 95)" />
        </ListItem>
         <ListItem disablePadding>
          <ListItemText primary="Price : le prix en dollars US ($326 - $18823)" />
        </ListItem>
         <ListItem disablePadding>
          <ListItemText primary="x : longueur en mm (0 - 10.74)" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="y : largeur en mm (0 - 58.9)" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="z : profondeur en mm (0 - 31.8)" />
        </ListItem>
      </List>
    </Box>
  );
}

export default About;