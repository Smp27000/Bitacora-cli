const fs = require('fs');
const path = require('path');
const Data = require('./notas');
const hash = require('object-hash');
const FechaActual = require('./fechas');


function CrearTexto(id, texto, etiqueta) {
    const fecha = FechaActual();
    const data = new Data(id, texto, etiqueta, fecha);
    data.ConstruirHash();
    fs.writeFileSync(data.id, );
}


module.exports = CrearTexto;