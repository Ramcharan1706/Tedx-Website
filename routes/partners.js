const express = require('express');
const router = express.Router();


const partners = [
  { name: 'Alpha Labs', tier: 'platinum', website: 'https://alphalabs.com' },
  { name: 'CloudNine', tier: 'gold', website: 'https://cloudnine.io' },
  { name: 'NovaTech', tier: 'gold', website: 'https://novatech.ai' },
  { name: 'Silverline', tier: 'silver', website: 'https://silverline.com' },
  { name: 'Astra Fund', tier: 'silver', website: 'https://astra.fund' },
  { name: 'PixelWorks', tier: 'bronze', website: 'https://pixelworks.dev' },
  { name: 'GreenGrit', tier: 'bronze', website: 'https://greengrit.eco' },
  { name: 'Route AI', tier: 'bronze', website: 'https://routeai.com' }
];


router.get('/', (req, res) => {
  res.json(partners);
});


router.get('/tier/:tier', (req, res) => {
  const tier = req.params.tier;
  const filteredPartners = partners.filter(p => p.tier === tier);
  res.json(filteredPartners);
});

module.exports = router;
