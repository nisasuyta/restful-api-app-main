const express = require('express');
const router = express.Router();
const PelatihanController = require('../controllers/PelatihanControllers');
const cekApiKey = require('../middlewares/cekApiKey');

router.get('/', PelatihanController.getAll);
router.get('/:id', PelatihanController.getById);
router.post('/', cekApiKey, PelatihanController.create);
router.put('/:id', cekApiKey, PelatihanController.update);
router.delete('/:id', cekApiKey, PelatihanController.remove);

module.exports = router;