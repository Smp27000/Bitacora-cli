const os = require('os');
const fechas = require('fechas-bitacora-samuelpalaciohoyos');
const notas = require('./notas');
const almacen = require('./almacen');

const CANTIDAD_POR_DEFECTO = 5;
const ETIQUETA_POR_DEFECTO = 'general';

function mostrarAyuda() {
    console.log(`
Bitacora CLI — registra lo que aprendes cada dia

Uso:
  npm start -- agregar "<texto>" [etiqueta]   Guarda una nota (etiqueta opcional, por defecto "${ETIQUETA_POR_DEFECTO}")
  npm start -- listar [N]                     Muestra las ultimas N notas (por defecto ${CANTIDAD_POR_DEFECTO})
  npm start -- buscar <palabra>               Muestra las notas que contienen la palabra
  npm start -- borrar <id>                    Elimina la nota con ese id
  npm start -- respaldar                      Copia data/notas.json a respaldos/
  npm start -- exportar [carpeta-destino]     Crea exportacion.txt y lo mueve a esa carpeta
  npm start -- ayuda                          Muestra esta ayuda

Ejemplos:
  npm start -- agregar "Hoy aprendi a usar fs" nodejs
  npm start -- listar 3
  npm start -- buscar fs
  npm start -- exportar C:\\Users\\tu-usuario\\Desktop
`);
}

// Muestra el mensaje y lo deja en la bitacora: fecha | comando | resultado
function responder(comando, mensaje) {
    console.log(mensaje);
    almacen.registrarAccion(comando, mensaje);
}

function formatearNota(nota) {
    return `[${nota.id}] (${nota.etiqueta}) ${fechas.getShortDate('es-ES', nota.fecha)} — ${nota.texto}`;
}

function ejecutarAgregar(args) {
    const texto = (args[0] || '').trim();
    const etiqueta = args[1] || ETIQUETA_POR_DEFECTO;

    if (texto === '') {
        return responder('agregar', 'No indicaste el texto de la nota. Ejemplo: npm start -- agregar "Hoy aprendi a usar fs" nodejs');
    }

    const resultado = notas.agregarNota(texto, etiqueta);

    if (!resultado.guardada) {
        return responder('agregar', `Ya existe una nota igual (id ${resultado.id}). No se guardo.`);
    }

    responder(
        'agregar',
        `Nota guardada [${resultado.id}] (${resultado.nota.etiqueta}) — ${fechas.getLongTime('es-ES', resultado.nota.fecha)}`
    );
}

function ejecutarListar(args) {
    let cantidad = parseInt(args[0], 10);

    if (isNaN(cantidad) || cantidad <= 0) {
        if (args[0] !== undefined) {
            console.log(`"${args[0]}" no es una cantidad valida; se muestran las ultimas ${CANTIDAD_POR_DEFECTO} notas.`);
        }
        cantidad = CANTIDAD_POR_DEFECTO;
    }

    const lista = notas.listarNotas(cantidad);

    if (lista.length === 0) {
        return responder('listar', 'Todavia no hay notas guardadas.');
    }

    lista.forEach((nota) => console.log(formatearNota(nota)));
    almacen.registrarAccion('listar', `${lista.length} notas mostradas`);
}

function ejecutarBuscar(args) {
    const palabra = (args[0] || '').trim();

    if (palabra === '') {
        return responder('buscar', 'Debes indicar una palabra para buscar. Ejemplo: npm start -- buscar fs');
    }

    const encontradas = notas.buscarNotas(palabra);

    if (encontradas.length === 0) {
        return responder('buscar', `No se encontraron notas que contengan "${palabra}".`);
    }

    encontradas.forEach((nota) => console.log(formatearNota(nota)));
    almacen.registrarAccion('buscar', `${encontradas.length} resultados para "${palabra}"`);
}

function ejecutarBorrar(args) {
    const id = (args[0] || '').trim();

    if (id === '') {
        return responder('borrar', 'Debes indicar el id de la nota. Ejemplo: npm start -- borrar 3f9a1c2e');
    }

    const eliminada = notas.borrarNota(id);

    if (!eliminada) {
        return responder('borrar', `No existe una nota con el id "${id}".`);
    }

    responder('borrar', `Nota eliminada [${eliminada.id}] — ${eliminada.texto}`);
}

function ejecutarRespaldar() {
    const destino = almacen.respaldarNotas();

    if (!destino) {
        return responder('respaldar', 'Todavia no hay notas para respaldar (no existe data/notas.json).');
    }

    responder('respaldar', `Respaldo creado en ${destino}`);
}

function ejecutarExportar(args) {
    const resultado = notas.exportarNotas(args[0] || os.homedir());

    if (!resultado.exportado) {
        return responder('exportar', resultado.motivo);
    }

    responder('exportar', `Exportacion lista en ${resultado.destino} (${resultado.total} notas).`);
}

function main() {
    const [comando, ...args] = process.argv.slice(2);

    switch (comando) {
        case 'agregar':
            return ejecutarAgregar(args);
        case 'listar':
            return ejecutarListar(args);
        case 'buscar':
            return ejecutarBuscar(args);
        case 'borrar':
            return ejecutarBorrar(args);
        case 'respaldar':
            return ejecutarRespaldar();
        case 'exportar':
            return ejecutarExportar(args);
        default:
            if (comando !== undefined && comando !== 'ayuda') {
                console.log(`El comando "${comando}" no existe.`);
            }
            mostrarAyuda();
            almacen.registrarAccion(comando || 'sin comando', 'ayuda mostrada');
    }
}

try {
    main();
} catch (error) {
    console.error(`Ocurrio un error: ${error.message}`);
}
