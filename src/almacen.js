const fs = require('fs');
const path = require('path');

// Rutas construidas desde la ubicacion de ESTE archivo (src),
// para que funcionen sin importar la carpeta desde la que se ejecute el programa.
const DIR_BASE = path.join(__dirname, '..');
const DIR_DATA = path.join(DIR_BASE, 'data');
const DIR_RESPALDOS = path.join(DIR_BASE, 'respaldos');
const DIR_SALIDA = path.join(DIR_BASE, 'salida');

const ARCHIVO_NOTAS = path.join(DIR_DATA, 'notas.json');
const ARCHIVO_BITACORA = path.join(DIR_DATA, 'bitacora.log');
const ARCHIVO_EXPORTACION = path.join(DIR_SALIDA, 'exportacion.txt');

function crearCarpetaSiNoExiste(ruta) {
    if (!fs.existsSync(ruta)) {
        fs.mkdirSync(ruta, { recursive: true });
    }
}

function existeRuta(ruta) {
    return fs.existsSync(ruta);
}

// Lee data/notas.json. Si el archivo o la carpeta no existen los crea con [].
// Si el contenido esta danado lanza un Error con un mensaje claro.
function leerNotas() {
    crearCarpetaSiNoExiste(DIR_DATA);

    if (!fs.existsSync(ARCHIVO_NOTAS)) {
        fs.writeFileSync(ARCHIVO_NOTAS, '[]');
        return [];
    }

    const contenido = fs.readFileSync(ARCHIVO_NOTAS, 'utf-8').trim();

    if (contenido === '') {
        return [];
    }

    let notas;
    try {
        notas = JSON.parse(contenido);
    } catch (error) {
        throw new Error(
            `El archivo ${ARCHIVO_NOTAS} esta danado: no contiene un JSON valido. Corrigelo o borralo para empezar de nuevo.`
        );
    }

    if (!Array.isArray(notas)) {
        throw new Error(
            `El archivo ${ARCHIVO_NOTAS} esta danado: se esperaba una lista de notas (un arreglo []).`
        );
    }

    return notas;
}

function escribirNotas(notas) {
    crearCarpetaSiNoExiste(DIR_DATA);
    fs.writeFileSync(ARCHIVO_NOTAS, JSON.stringify(notas, null, 2));
}

// Bitacora de acciones: agrega una linea con el formato fecha | comando | resultado
function registrarAccion(comando, resultado) {
    crearCarpetaSiNoExiste(DIR_DATA);
    const linea = `${new Date().toISOString()} | ${comando} | ${resultado}\n`;
    fs.appendFileSync(ARCHIVO_BITACORA, linea);
}

// Reto 1: copia data/notas.json a respaldos/notas_<marca-de-tiempo>.json
function respaldarArchivoNotas() {
    if (!fs.existsSync(ARCHIVO_NOTAS)) {
        return null;
    }

    crearCarpetaSiNoExiste(DIR_RESPALDOS);
    const destino = path.join(DIR_RESPALDOS, `notas_${Date.now()}.json`);
    fs.copyFileSync(ARCHIVO_NOTAS, destino);
    return destino;
}

// Reto 2: crea salida/exportacion.txt con el contenido que reciba
function crearArchivoExportacion(contenido) {
    crearCarpetaSiNoExiste(DIR_SALIDA);
    fs.writeFileSync(ARCHIVO_EXPORTACION, contenido);
    return ARCHIVO_EXPORTACION;
}

// Mueve un archivo. Si el origen y el destino estan en discos distintos,
// renameSync falla con EXDEV: en ese caso se copia y se borra el original.
function moverArchivo(origen, destino) {
    try {
        fs.renameSync(origen, destino);
    } catch (error) {
        if (error.code === 'EXDEV') {
            fs.copyFileSync(origen, destino);
            fs.unlinkSync(origen);
            return;
        }
        throw error;
    }
}

module.exports = {
    DIR_DATA,
    DIR_RESPALDOS,
    DIR_SALIDA,
    ARCHIVO_NOTAS,
    leerNotas,
    escribirNotas,
    registrarAccion,
    respaldarArchivoNotas,
    crearArchivoExportacion,
    moverArchivo,
    crearCarpetaSiNoExiste,
    existeRuta
};
