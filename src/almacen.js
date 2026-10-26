const fs = require('fs');
const path = require('path');

// Rutas armadas desde la ubicacion de ESTE archivo (src), asi funcionan
// aunque ejecutes el programa desde otra carpeta.
const DIR_DATA = path.join(__dirname, '..', 'data');
const DIR_RESPALDOS = path.join(__dirname, '..', 'respaldos');
const DIR_SALIDA = path.join(__dirname, '..', 'salida');

const ARCHIVO_NOTAS = path.join(DIR_DATA, 'notas.json');
const ARCHIVO_BITACORA = path.join(DIR_DATA, 'bitacora.log');
const ARCHIVO_EXPORTACION = path.join(DIR_SALIDA, 'exportacion.txt');

// recursive: true crea las carpetas que falten y no falla si ya existe.
function crearCarpeta(ruta) {
    fs.mkdirSync(ruta, { recursive: true });
}

function existeRuta(ruta) {
    return fs.existsSync(ruta);
}

// Lee data/notas.json. Si no existe lo crea con []. Si esta danado lanza un Error claro.
function leerNotas() {
    crearCarpeta(DIR_DATA);

    if (!existeRuta(ARCHIVO_NOTAS)) {
        fs.writeFileSync(ARCHIVO_NOTAS, '[]');
        return [];
    }

    const contenido = fs.readFileSync(ARCHIVO_NOTAS, 'utf-8').trim();
    if (contenido === '') return [];

    let notas;
    try {
        notas = JSON.parse(contenido);
    } catch {
        notas = null;
    }

    if (!Array.isArray(notas)) {
        throw new Error(
            `El archivo ${ARCHIVO_NOTAS} esta danado: debe contener una lista de notas ([]). Corrigelo o borralo para empezar de nuevo.`
        );
    }

    return notas;
}

function escribirNotas(notas) {
    crearCarpeta(DIR_DATA);
    fs.writeFileSync(ARCHIVO_NOTAS, JSON.stringify(notas, null, 2));
}

// Bitacora de acciones: una linea por comando con el formato fecha | comando | resultado
function registrarAccion(comando, resultado) {
    crearCarpeta(DIR_DATA);
    fs.appendFileSync(ARCHIVO_BITACORA, `${new Date().toISOString()} | ${comando} | ${resultado}\n`);
}

// Reto 1: copia data/notas.json a respaldos/notas_<marca-de-tiempo>.json
function respaldarNotas() {
    if (!existeRuta(ARCHIVO_NOTAS)) return null;

    crearCarpeta(DIR_RESPALDOS);
    const destino = path.join(DIR_RESPALDOS, `notas_${Date.now()}.json`);
    fs.copyFileSync(ARCHIVO_NOTAS, destino);
    return destino;
}

// Reto 2: escribe salida/exportacion.txt con el contenido que reciba
function crearArchivoExportacion(contenido) {
    crearCarpeta(DIR_SALIDA);
    fs.writeFileSync(ARCHIVO_EXPORTACION, contenido);
    return ARCHIVO_EXPORTACION;
}

// Mueve un archivo. Si origen y destino estan en discos distintos,
// renameSync falla con EXDEV y entonces hay que copiar y borrar.
function moverArchivo(origen, destino) {
    try {
        fs.renameSync(origen, destino);
    } catch (error) {
        if (error.code !== 'EXDEV') throw error;
        fs.copyFileSync(origen, destino);
        fs.unlinkSync(origen);
    }
}

module.exports = {
    leerNotas,
    escribirNotas,
    registrarAccion,
    respaldarNotas,
    crearArchivoExportacion,
    moverArchivo,
    existeRuta
};
