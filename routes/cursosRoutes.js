const express = require('express');
const router=express.Router();
const cursosController = require('../controllers/cursosController'); 


router.get('/', cursosController.consultar);
router.post('/', cursosController.insertar);


router.route('/:id')
    .put(cursosController.modificar)
    .delete(cursosController.eliminar)
    .get(cursosController.consultarUno);
    
module.exports=router