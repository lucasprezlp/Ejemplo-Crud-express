const { json } = require('express');
const db = require('../database/conexion');

class ProfesorController {

    async consultar(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM profesores;');
            res.status(200).json(rows); // estatus 200 es todo ok
        } catch (err) {
            res.status(500).send(err.message); // estatus 500 error del servidor
        }
    }

    async consultarUno(req, res) {
        const { id } = req.params;
        try {
            const [rows] = await db.query('SELECT * FROM profesores WHERE id=?;', [id]);
            if (rows.length > 0) {
                res.status(200).json(rows[0]);
            } else {
                res.status(400).json({ mens: 'Profesor no encontrado' });
            }
        } catch (err) {
            res.status(500).send(err.message); // estatus 500 error del servidor
        }
    }

    async insertar(req, res) {
        const { dni, nombre, apellido, email, profesion, telefono } = req.body;
        try {
            const [result] = await db.query(
                'INSERT INTO profesores (dni, nombre, apellido, email, profesion, telefono) VALUES (?, ?, ?, ?, ?, ?);',
                [dni, nombre, apellido, email, profesion, telefono]
            );
            res.status(200).json({ id: result.insertId });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async modificar(req, res) {
        const { id } = req.params;
        const { dni, nombre, apellido, email, profesion, telefono } = req.body;
        try {
            const [result] = await db.query(
                `UPDATE profesores SET dni=?, nombre=?, apellido=?, email=?, profesion=?, telefono=? WHERE id=?`,
                [dni, nombre, apellido, email, profesion, telefono, id]
            );
            if (result.affectedRows === 1) {
                res.status(200).json({ res: 'Profesor actualizado' });
            } else {
                res.status(404).send('Profesor no encontrado');
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async eliminar(req, res) {
        const { id } = req.params;
        const conn = await db.getConnection(); // se crea una conexion aparte para hacer una transacion atomica, unica.
        try {
            await conn.beginTransaction();
            const [cursosRes] = await conn.query('SELECT COUNT(*) AS cant FROM cursos WHERE profesor_id=?', [id]);
            if (cursosRes[0].cant > 0) {
                await conn.rollback(); // Asegúrate de hacer rollback si hay cursos asignados
                return res.status(400).json({ mens: 'El profesor tiene cursos asignados' });
            }
            const [deleteRes] = await conn.query('DELETE FROM profesores WHERE id=?', [id]);
            if (deleteRes.affectedRows === 1) {
                await conn.commit();
                res.status(200).json({ mens: 'El profesor fue eliminado' });
            } else {
                await conn.rollback();
                res.status(404).json({ mens: 'El profesor no encontrado' });
            }
        } catch (err) {
            await conn.rollback(); // Rollback si hay un error
            res.status(500).send(err.message); // estatus 500 error del servidor
        } finally {
            conn.release();
        }
    }
}

module.exports = new ProfesorController();
