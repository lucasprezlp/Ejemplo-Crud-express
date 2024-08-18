const db = require('../database/conexion');

class CursosController {
    constructor() { }

    async consultar(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM cursos;');
            res.status(200).json(rows); // Estatus 200 es todo ok
        } catch (err) {
            res.status(500).send(err.message); // Estatus 500 error del servidor
        }
    }

    async consultarUno(req, res) {
        const { id } = req.params;
        try {
            const [rows] = await db.query('SELECT * FROM cursos WHERE id=?;', [id]);
            if(rows.length>0){
                res.status(200).json(rows[0]);
            } else {
                res.status(400).json({mens:'curso no encotrado'});
            }
        } catch (err) {
            res.status(500).send(err.message); // Estatus 500 error del servidor
        }
    }

    async insertar(req, res) {
        const { nombre, descripcion, profesor_id } = req.body;
        const conn = await db.getConnection();
    
        try {
            await conn.beginTransaction();
            // Verificar si el profesor existe
            const [cursRes] = await conn.query('SELECT COUNT(*) AS cant FROM profesores WHERE id=?', [profesor_id]);
            if (cursRes[0].cant === 0) {
                await conn.rollback(); // Revertir la transacción
                return res.status(400).json({ mens: 'El profesor no existe' });
            }
    
            // Insertar el nuevo curso
            const [insertEst] = await conn.query('INSERT INTO cursos (nombre, descripcion, profesor_id) VALUES (?, ?, ?)', [nombre, descripcion, profesor_id]);
    
            if (insertEst.affectedRows === 1) {
                await conn.commit(); // Confirmar la transacción
                res.status(200).json({ id: insertEst.insertId });
            } else {
                await conn.rollback(); // Revertir la transacción en caso de fallo
                res.status(404).json({ mens: 'El curso no pudo ser insertado' });
            }

        }
        catch (err) {
            res.status(500).send(err.message);
            try {
                await conn.rollback(); // Asegurarse de revertir en caso de error
            } catch (errRoll) {
                // Si el rollback falla, informar sobre el problema
                return res.status(500).send(`Error al revertir la transacción: ${errRoll.message}`);
            }
        }
        finally {
            conn.release(); // Liberar la conexión
        }
    }

    async modificar(req, res) {
        const { id } = req.params;
        const { nombre, descripcion, profesor_id } = req.body;
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [cursRes] = await conn.query('SELECT COUNT(*) AS cant FROM profesores WHERE id=?', [profesor_id]);
            if (cursRes[0].cant === 0) {
                await conn.rollback();
                return res.status(400).json({ mens: 'El profesor no existe' });
            }

            const [inserEst] = await conn.query('UPDATE cursos SET nombre=?, descripcion=?, profesor_id=? WHERE id=?', [nombre, descripcion, profesor_id, id]);

            if (inserEst.affectedRows === 1) {
                await conn.commit();
                res.status(200).json({id:inserEst.insertId});
            }
        } catch (err) {
            try {
                await conn.rollback();
            } catch (error) {
                res.status(500).send(error.message); // Estatus 500 error del servidor
            }
            res.status(500).send(err.message); // Estatus 500 error del servidor
        } finally {
            conn.release();
        }
    }

    async eliminar(req, res) {
        const { id } = req.params;
        try {
            const [deleteRes] = await db.query('DELETE FROM cursos WHERE id=?', [id]);
            if (deleteRes.affectedRows === 1) {
                res.status(200).json({ mens: 'Curso borrado' });
            } else {
                res.status(400).json({ mens: 'Curso no existe' });
            }
        } catch (err) {
            res.status(500).send(err.message); // Estatus 500 error del servidor
        }
    }
}

module.exports = new CursosController();
