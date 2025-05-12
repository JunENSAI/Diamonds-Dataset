import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardMedia, CardContent } from '@mui/material';


const IMAGE_URLS = {
    carat: "https://www.carat.ch/media/full/cache/C/A/CARAT_20_IMAGES_ARTICLES_DIAMANTS_CARAT.jpg",
    color: "https://bijouterielanglois.com/pub/media/wysiwyg/Guide/Couleur_diamant/Couleurs_Diamants.jpg",
    clarity: "https://bijouterielanglois.com/pub/media/wysiwyg/Guide/Clarte/Purete_Diamants.jpg",
    cut: "https://www.vuillermoz.fr/uploads/cms/encyclopedie-des-pierres/diamond-cut.jpg"
};

const DESCRIPTIONS = {
    carat: `Le poids est exprimé en carats, 1 carat = 0.2 grammes.
            Les diamants de grande envergure sont de plus en plus rare ce qui font que leurs valeurs
            soient plus élevées que ceux de petites tailles.
            Mais pour estimer le prix d'un diamant il n'y a pas que sa taille qui compte ; cela est
            mis en évidence dans cette base de données où les diamants même de petites tailles ont une
            grande valeur. Ceci est dû à la rareté de la couleur ou d'autres caractéristiques.`,
    color: `La couleur d'un diamant évolue du pur éclat de blanc (D) à un jaune éclat (Z). Dans notre
            cas, la couleur varie de D à J ; D étant la meilleure couleur et J la pire ici.`,
    clarity: `La clarté fait référence à la présence et à la visibilité des inclusions (imperfections internes)
              et des défauts de surface dans un diamant. Un diamant avec une clarté plus élevée (IF, VVS, VS) aura
              généralement moins d'inclusions et sera considéré comme plus précieux. Les
              diamants avec des grades de clarté inférieurs (SI, I) peuvent présenter
              des inclusions visibles à l'œil nu, ce qui peut affecter leur éclat et leur beauté.`,
    cut: `La qualité de la coupe d'un diamant est un facteur essentiel qui influence son éclat,
          sa brillance et sa beauté globale. Une coupe bien réalisée permet à la lumière de se refléter et de se
          disperser de manière optimale à travers le diamant, ce qui lui confère un éclat éblouissant et
          une apparence attrayante.`
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

function Overview() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Diamond characteristics">
          <Tab label="Poids (Carat)" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
          <Tab label="Couleur" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
          <Tab label="Clarté" id="simple-tab-2" aria-controls="simple-tabpanel-2" />
          <Tab label="Coupe" id="simple-tab-3" aria-controls="simple-tabpanel-3" />
        </Tabs>
      </Box>

      {/* Carat */}
      <TabPanel value={value} index={0}>
        <Card>
          <CardContent>
             <Typography variant="h5" gutterBottom>Observation Carat</Typography>
             <Typography variant="body1">{DESCRIPTIONS.carat}</Typography>
          </CardContent>
          <CardMedia
            component="img"
            alt="Diamond Carat Comparison"
            image={IMAGE_URLS.carat}
            sx={{ objectFit: 'contain', maxHeight: 500, width: 'auto', margin: 'auto' }} // Adjust styling
          />
        </Card>
      </TabPanel>

      {/* Color */}
      <TabPanel value={value} index={1}>
        <Card>
          <CardContent>
             <Typography variant="h5" gutterBottom>Couleur</Typography>
             <Typography variant="body1">{DESCRIPTIONS.color}</Typography>
          </CardContent>
          <CardMedia
            component="img"
            alt="Diamond Color Scale"
            image={IMAGE_URLS.color}
             sx={{ objectFit: 'contain', maxHeight: 300, width: 'auto', margin: 'auto' }}
          />
        </Card>
      </TabPanel>

      {/* Clarity */}
      <TabPanel value={value} index={2}>
         <Card>
           <CardContent>
             <Typography variant="h5" gutterBottom>Pureté ou Clarté</Typography>
             <Typography variant="body1">{DESCRIPTIONS.clarity}</Typography>
           </CardContent>
           <CardMedia
            component="img"
            alt="Diamond Clarity Scale"
            image={IMAGE_URLS.clarity}
             sx={{ objectFit: 'contain', maxHeight: 300, width: 'auto', margin: 'auto' }}
           />
        </Card>
      </TabPanel>

      {/* Cut */}
       <TabPanel value={value} index={3}>
         <Card>
            <CardContent>
             <Typography variant="h5" gutterBottom>Coupe</Typography>
             <Typography variant="body1">{DESCRIPTIONS.cut}</Typography>
            </CardContent>
            <CardMedia
                component="img"
                alt="Diamond Cut Quality"
                image={IMAGE_URLS.cut}
                sx={{ objectFit: 'contain', maxHeight: 300, width: 'auto', margin: 'auto' }}
            />
         </Card>
      </TabPanel>
    </Box>
  );
}

export default Overview;