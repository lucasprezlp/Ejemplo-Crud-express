const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesoresController'); // Asegúrate que el nombre esté bien

router.get('/', profesorController.consultar);
router.get('/:id', profesorController.consultarUno);
router.post('/', profesorController.insertar);
router.put('/:id', profesorController.modificar);
router.delete('/:id', profesorController.eliminar);

module.exports = router;