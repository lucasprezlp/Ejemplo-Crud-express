const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const estudiantesRouter = require('./routes/estudiantesRouter');
const profesoresRouter = require('./routes/profesoresRouter');
const cursosRouter = require('./routes/cursosRoutes');
const inscripcionesRouter = require('./routes/inscripcionRoutes');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('App Universidad');
});

app.use('/estudiantes', estudiantesRouter);
app.use('/profesores', profesoresRouter);
app.use('/cursos', cursosRouter);
app.use('/inscripciones', inscripcionesRouter);

app.listen(port, () => {
    console.log(`Servidor activo en ${port}`);
});