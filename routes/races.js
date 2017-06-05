const express = require('express');
const router = express.Router();

// TODO query database for running races
let currentRaces = [
  { id: 0, name: 'Room-0' },
  { id: 1, name: 'Room-1' },
  { id: 2, name: 'Room-2' },
  { id: 3, name: 'Room-3' },
  { id: 4, name: 'Room-4' },
  { id: 5, name: 'Room-5' },
  { id: 6, name: 'Room-6' },
  { id: 7, name: 'Room-7' },
  { id: 8, name: 'Room-8' },
  { id: 9, name: 'Room-9' }
];

/* GET race listing. */
router.get('/races', function(req, res, next) {
  res.json(currentRaces);
});

module.exports = router;
