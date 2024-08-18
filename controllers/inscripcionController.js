const { json } = require('express');
const db = require('../database/conexion');

class InscripcionController {
    async inscribir(req, res) {
        const { curso_id, estudiante_id } = req.body;
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Verificar si existe el estudiante
            const [estRes] = await conn.query(`SELECT COUNT(*) AS cant FROM estudiantes WHERE id=?`, [estudiante_id]);
            if (estRes[0].cant === 0) {
                await conn.rollback();
                return res.status(400).json({ mens: 'El estudiante no existe' });
            }

            // Verificar si existe el curso
            const [curRes] = await conn.query(`SELECT COUNT(*) AS cant FROM cursos WHERE id=?`, [curso_id]);
            if (curRes[0].cant === 0) {
                await conn.rollback();
                return res.status(400).json({ mens: 'El curso no existe' });
            }

            // Verificar si el estudiante ya está inscrito en el curso
            const [existsRes] = await conn.query(`SELECT COUNT(*) AS cant FROM cursos_estudiantes WHERE curso_id=? AND estudiante_id=?`, [curso_id, estudiante_id]);
            if (existsRes[0].cant > 0) {
                await conn.rollback();
                return res.status(400).json({ mens: 'El estudiante ya está inscrito en el curso' });
            }

            // Insertar en la tabla inscripciones
            const [insertRes] = await conn.query('INSERT INTO cursos_estudiantes (curso_id, estudiante_id) VALUES (?, ?)', [curso_id, estudiante_id]);
            if (insertRes.affectedRows === 1) {
                await conn.commit();
                res.status(200).json({ mens: 'Estudiante inscrito en el curso' });
            } else {
                await conn.rollback();
                res.status(404).json({ mens: 'La inscripción no se pudo realizar' });
            }
        } catch (err) {
            try {
                await conn.rollback();
            } catch (errRoll) {
                res.status(500).json({ error: errRoll.message });
            }
            res.status(500).json({ error: err.message });
        } finally {
            conn.release();
        }
    }

    async consultarTodos(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso 
                FROM cursos_estudiantes
                INNER JOIN cursos ON cursos_estudiantes.curso_id=cursos.id
                INNER JOIN estudiantes ON cursos_estudiantes.estudiante_id=estudiantes.id
            `);
            res.status(200).json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async consultarxCurso(req, res) {
        const { id } = req.params;
        try {
            const [rows] = await db.query(`
                SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso 
                FROM cursos_estudiantes
                INNER JOIN cursos ON cursos_estudiantes.curso_id=cursos.id
                INNER JOIN estudiantes ON cursos_estudiantes.estudiante_id=estudiantes.id
                WHERE cursos.id = ?`, [id]);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async consultarxAlumno(req, res) {
        const { id } = req.params;
        try {
            const [rows] = await db.query(`
                SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso 
                FROM cursos_estudiantes
                INNER JOIN cursos ON cursos_estudiantes.curso_id=cursos.id
                INNER JOIN estudiantes ON cursos_estudiantes.estudiante_id=estudiantes.id
                WHERE estudiantes.id = ?`, [id]);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async cancelarInscripcion(req, res) {
        const { estudiante_id, curso_id } = req.params;
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Verificar si existe el estudiante
            const [estRes] = await conn.query(`SELECT COUNT(*) AS cant FROM estudiantes WHERE id=?`, [estudiante_id]);
            if (estRes[0].cant === 0) {
                await conn.rollback();
                return res.status(400).json({ mens: 'El estudiante no existe' });
            }

            // Verificar si existe el curso
            const [curRes] = await conn.query(`SELECT COUNT(*) AS cant FROM cursos WHERE id=?`, [curso_id]);
            if (curRes[0].cant === 0) {
                await conn.rollback();
                return res.status(400).json({ mens: 'El curso no existe' });
            }

            // Verificar si existe la inscripcion
            const [existsRes] = await conn.query(`SELECT COUNT(*) AS cant FROM cursos_estudiantes WHERE estudiante_id=? AND curso_id=?`, [estudiante_id, curso_id]);
            if (existsRes[0].cant === 0) {
                await conn.rollback();
                return res.status(400).json({ mens: 'La inscripcion no existe' });
            }

            // Cancelar la inscripcion
            const [deleteRes] = await conn.query(`DELETE FROM cursos_estudiantes WHERE estudiante_id=? AND curso_id=?`, [estudiante_id, curso_id]);
            if (deleteRes.affectedRows === 1) {
                await conn.commit();
                res.status(200).json({ mens: 'Inscripcion cancelada' });
            } else {
                await conn.rollback();
                res.status(400).json({ mens: 'Error al cancelar la inscripcion' });
            }
        } catch (err) {
            try {
                await conn.rollback();
            } catch (errRoll) {
                res.status(500).json({ error: errRoll.message });
            }
            res.status(500).json({ error: err.message });
        } finally {
            conn.release();
        }
    }
}

module.exports = new InscripcionController();
