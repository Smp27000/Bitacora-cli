const path = require('path');
const hash = require('object-hash');
const almacen = require('./almacen');
const fechas = require('./fechas');

const ETIQUETA_POR_DEFECTO = 'general';

// El id de la nota son los primeros 8 caracteres del hash del texto.
function crearId(texto) {
    return hash(texto).slice(0, 8);
}

function agregarNota(texto, etiqueta = ETIQUETA_POR_DEFECTO) {
    const notas = almacen.leerNotas();
    const id = crearId(texto);
    const repetida = notas.find((nota) => nota.id === id);

    if (repetida) {
        return { guardada: false, id: repetida.id, nota: repetida };
    }

    const nota = {
        id,
        texto,
        etiqueta: etiqueta || ETIQUETA_POR_DEFECTO,
        fecha: fechas.getTimeStamp()
    };

    notas.push(nota);
    almacen.escribirNotas(notas);

    return { guardada: true, id, nota };
}

// Devuelve las ultimas "cantidad" notas, la mas reciente primero.
function listarNotas(cantidad = 5) {
    const notas = almacen.leerNotas();
    return notas.slice(-cantidad).reverse();
}

function buscarNotas(palabra) {
    const objetivo = palabra.toLowerCase();
    const notas = almacen.leerNotas();
    return notas.filter((nota) => nota.texto.toLowerCase().includes(objetivo));
}

function borrarNota(id) {
    const notas = almacen.leerNotas();
    const indice = notas.findIndex((nota) => nota.id === id);

    if (indice === -1) {
        return null;
    }

    const [eliminada] = notas.splice(indice, 1);
    almacen.escribirNotas(notas);
    return eliminada;
}

function respaldarNotas() {
    return almacen.respaldarArchivoNotas();
}

function construirContenidoExportacion(notas) {
    const encabezado = [
        'BITACORA DE NOTAS',
        `Exportada el ${fechas.getLongTime('es-ES')}`,
        `Total de notas: ${notas.length}`,
        ''
    ];

    const lineas = notas.map((nota) =>
        `[${nota.id}] (${nota.etiqueta}) ${fechas.getShortDate('es-ES', nota.fecha)} — ${nota.texto}`
    );

    return [...encabezado, ...lineas, ''].join('\n');
}

// Reto 2: genera exportacion.txt en salida/ y lo MUEVE a una ruta absoluta.
function exportarNotas(destino) {
    if (!path.isAbsolute(destino)) {
        return {
            exportado: false,
            motivo: `La ruta "${destino}" no es absoluta. Indica una ruta absoluta, por ejemplo C:\\Users\\tu-usuario\\Desktop.`
        };
    }

    if (!almacen.existeRuta(destino)) {
        return {
            exportado: false,
            motivo: `La carpeta "${destino}" no existe, asi que no se movio nada.`
        };
    }

    const notas = almacen.leerNotas();
    const origen = almacen.crearArchivoExportacion(construirContenidoExportacion(notas));
    const destinoFinal = path.join(destino, 'exportacion.txt');

    almacen.moverArchivo(origen, destinoFinal);

    return { exportado: true, destino: destinoFinal, total: notas.length };
}

module.exports = {
    crearId,
    agregarNota,
    listarNotas,
    buscarNotas,
    borrarNota,
    respaldarNotas,
    exportarNotas
};
