

const { json } = require('express')
const db = require('../database/conexion')

class EstudianteController {
    constructor() { }

    async consultar(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM estudiantes;');
            res.status(200).json(rows); // estatus 200 es todo ok
        } catch (err) {
            res.status(500).send(err.message); // estatus 500 error del servidor
        }
    }

    async consultarUno(req, res) {
        try {
            const { id } = req.params; // el id viene por la URL
            const [rows] = await db.query('SELECT * FROM estudiantes WHERE id=?;', [id])
            if (rows.length > 0) {
                res.status(200).json(rows[0]);
            } else {
                res.status(404).send('Estudiante no encontado');
            }
        }
        catch (err) {
            res.status(500).send(err.message); // estatus 500 error del servidor
        }
    }

    async insertar(req, res) {
        try {
            const { dni, nombre, apellido, email } = req.body;
            const [rows] = await db.query(
                'INSERT INTO estudiantes (dni, nombre, apellido, email) VALUES (?, ?, ?, ?);',
                [dni, nombre, apellido, email]
            );
            res.status(200).json({ id: result.insertId });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }


    async modificar(req, res) {
        try {
            const { id } = req.params;
            const { dni, nombre, apellido, email } = req.body;
            const [result] = await db.query(`UPDATE estudiantes SET dni=?,nombre=?,apellido=?,email=? WHERE id=?`,
                [dni, nombre, apellido, email, id]
            );
            if (rows.affectedRows === 1) {
                res.status(200).json({ res: 'Estudiante actualizado' })
            } else {
                res.status(404).send('Estudiante no encontrado')
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    }


    async eliminar(req, res) { // debemo trabajar con transaciones ***
        const { id } = req.params;
        const conn = await db.getConnection(); // genermaos una nueva conexion

        try {
            await conn.beginTransaction();
            const [curRes] = await db.query('SELECT COUNT(*) AS cant FROM cursos_estudiantes WHERE estudiante_id=?', [id]);
            if (curRes[0].cant > 0) {
                await conn.rollback(); // Asegúrate de hacer rollback si hay estudiante cursado una materia ****
                return res.status(400).json({ mens: 'Estudiante cursando una materia, no se puede eliminar' });
            }

            const [deleteRes] = await db.query('DELETE FROM estudiantes WHERE id=?', [id]);
            if (deleteRes.effectedRows === 1) {
                await conn.commit();  //****
                res.status(200).json({ res: 'Estudiante eliminado' });
            } else {
                await conn.rollback(); //****
                res.status(404).send('Estudiante no se encuentra');
            }
        } catch (err) {
            try {
                await conn.rollback();
            } catch (errRoll) {
                res.status(500).send(errRoll.message); // estatus 500 error del servidor
            }
            res.status(500).send(errRoll.message);
        }
        finally{
            conn.release(); // liberamos la conexión
        }
    }
}
module.exports = new EstudianteController();  // exportamos la clase