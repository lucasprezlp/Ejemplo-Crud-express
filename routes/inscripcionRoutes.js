const express = require('express');
const router = express.Router();
const inscripcionController = require('../controllers/inscripcionController');



router.get('/', inscripcionController.consultarTodos);
router.get('/xCurso/:id', inscripcionController.consultarxCurso);
router.get('/xAlumno/:id', inscripcionController.consultarxAlumno);
router.post('/', inscripcionController.inscribir);
router.delete('/:estudiante_id/:curso_id', inscripcionController.cancelarInscripcion);

// router.post('/', inscripcionController.inscribir); Eliminar inscipcion

module.exports = router;