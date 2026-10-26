const path = require('path');
const hash = require('object-hash');
const almacen = require('./almacen');
const fechas = require('fechas-bitacora-samuelpalaciohoyos');

const ETIQUETA_POR_DEFECTO = 'general';

// El id de la nota son los primeros 8 caracteres del hash del texto.
function crearId(texto) {
    return hash(texto).slice(0, 8);
}

// Guarda una nota. Si ya hay una con el mismo texto devuelve guardada: false.
function agregarNota(texto, etiqueta = ETIQUETA_POR_DEFECTO) {
    const notas = almacen.leerNotas();
    const id = crearId(texto);

    if (notas.some((nota) => nota.id === id)) {
        return { guardada: false, id };
    }

    const nota = { id, texto, etiqueta, fecha: fechas.getTimeStamp() };
    notas.push(nota);
    almacen.escribirNotas(notas);

    return { guardada: true, id, nota };
}

// Ultimas "cantidad" notas, la mas reciente primero.
function listarNotas(cantidad = 5) {
    return almacen.leerNotas().slice(-cantidad).reverse();
}

// Notas cuyo texto contiene la palabra (sin distinguir mayusculas).
function buscarNotas(palabra) {
    const objetivo = palabra.toLowerCase();
    return almacen.leerNotas().filter((nota) => nota.texto.toLowerCase().includes(objetivo));
}

// Borra la nota con ese id. Devuelve la nota borrada o null si no existe.
function borrarNota(id) {
    const notas = almacen.leerNotas();
    const indice = notas.findIndex((nota) => nota.id === id);
    if (indice === -1) return null;

    const [eliminada] = notas.splice(indice, 1);
    almacen.escribirNotas(notas);
    return eliminada;
}

// Texto plano con todas las notas.
function contenidoExportacion(notas) {
    const lineas = notas.map((nota) =>
        `[${nota.id}] (${nota.etiqueta}) ${fechas.getShortDate('es-ES', nota.fecha)} — ${nota.texto}`
    );

    return [
        'BITACORA DE NOTAS',
        `Exportada el ${fechas.getLongTime('es-ES')}`,
        `Total de notas: ${notas.length}`,
        '',
        ...lineas,
        ''
    ].join('\n');
}

// Reto 2: crea exportacion.txt en salida/ y lo MUEVE a una carpeta absoluta existente.
function exportarNotas(destino) {
    if (!path.isAbsolute(destino)) {
        return {
            exportado: false,
            motivo: `La ruta "${destino}" no es absoluta. Indica una ruta absoluta, por ejemplo C:\\Users\\tu-usuario\\Desktop.`
        };
    }

    if (!almacen.existeRuta(destino)) {
        return { exportado: false, motivo: `La carpeta "${destino}" no existe, asi que no se movio nada.` };
    }

    const notas = almacen.leerNotas();
    const origen = almacen.crearArchivoExportacion(contenidoExportacion(notas));
    const destinoFinal = path.join(destino, 'exportacion.txt');
    almacen.moverArchivo(origen, destinoFinal);

    return { exportado: true, destino: destinoFinal, total: notas.length };
}

module.exports = {
    agregarNota,
    listarNotas,
    buscarNotas,
    borrarNota,
    exportarNotas
};
