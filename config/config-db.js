module.exports = {
    host: '127.0.0.1',
    user:('root'),
    password:'',
    database:('universidad'),
    port:3306,
    waitForConnections: true, // para trabajas con promesas
    connectionLimit:10, /// hasta 10 conexiones
    queueLimit:0 // en cola no se permiten ni uno
};