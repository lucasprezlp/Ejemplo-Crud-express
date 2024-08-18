const express = require('express');
const router=express.Router();
const estudianteController = require('../controllers/estudianteController'); // le decimos donde esta ubicada la clase que tiene los procedimientos



router.get('/', estudianteController.consultar);

router.post('/', estudianteController.insertar);

// el modificar, borrar, consultar necesitan un ID por lo que se los vamos a pasar con parte de la ruta
router.route('/:id')
    .put(estudianteController.modificar)
    .delete(estudianteController.eliminar)
    .get(estudianteController.consultarUno);
module.exports=router