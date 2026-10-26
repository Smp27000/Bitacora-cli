const os = require('os');
const fechas = require('./fechas');
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

function formatearNota(nota) {
    return `[${nota.id}] (${nota.etiqueta}) ${fechas.getShortDate('es-ES', nota.fecha)} — ${nota.texto}`;
}

function ejecutarAgregar(args) {
    const texto = (args[0] || '').trim();
    const etiqueta = args[1] || ETIQUETA_POR_DEFECTO;

    if (texto === '') {
        console.log('No indicaste el texto de la nota. Ejemplo: npm start -- agregar "Hoy aprendi a usar fs" nodejs');
        almacen.registrarAccion('agregar', 'error: texto vacio o ausente');
        return;
    }

    const resultado = notas.agregarNota(texto, etiqueta);

    if (!resultado.guardada) {
        console.log(`Ya existe una nota igual (id ${resultado.id}). No se guardo.`);
        almacen.registrarAccion('agregar', `duplicada (id ${resultado.id})`);
        return;
    }

    console.log(
        `Nota guardada [${resultado.id}] (${resultado.nota.etiqueta}) — ${fechas.getLongTime('es-ES', resultado.nota.fecha)}`
    );
    almacen.registrarAccion('agregar', `guardada (id ${resultado.id})`);
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
        console.log('Todavia no hay notas guardadas.');
        almacen.registrarAccion('listar', 'sin notas');
        return;
    }

    lista.forEach((nota) => console.log(formatearNota(nota)));
    almacen.registrarAccion('listar', `${lista.length} notas mostradas`);
}

function ejecutarBuscar(args) {
    const palabra = (args[0] || '').trim();

    if (palabra === '') {
        console.log('Debes indicar una palabra para buscar. Ejemplo: npm start -- buscar fs');
        almacen.registrarAccion('buscar', 'error: palabra ausente');
        return;
    }

    const encontradas = notas.buscarNotas(palabra);

    if (encontradas.length === 0) {
        console.log(`No se encontraron notas que contengan "${palabra}".`);
        almacen.registrarAccion('buscar', `0 resultados para "${palabra}"`);
        return;
    }

    encontradas.forEach((nota) => console.log(formatearNota(nota)));
    almacen.registrarAccion('buscar', `${encontradas.length} resultados para "${palabra}"`);
}

function ejecutarBorrar(args) {
    const id = (args[0] || '').trim();

    if (id === '') {
        console.log('Debes indicar el id de la nota. Ejemplo: npm start -- borrar 3f9a1c2e');
        almacen.registrarAccion('borrar', 'error: id ausente');
        return;
    }

    const eliminada = notas.borrarNota(id);

    if (!eliminada) {
        console.log(`No existe una nota con el id "${id}".`);
        almacen.registrarAccion('borrar', `error: id ${id} inexistente`);
        return;
    }

    console.log(`Nota eliminada [${eliminada.id}] — ${eliminada.texto}`);
    almacen.registrarAccion('borrar', `eliminada (id ${eliminada.id})`);
}

function ejecutarRespaldar() {
    const destino = notas.respaldarNotas();

    if (!destino) {
        console.log('Todavia no hay notas para respaldar (no existe data/notas.json).');
        almacen.registrarAccion('respaldar', 'error: no existe notas.json');
        return;
    }

    console.log(`Respaldo creado en ${destino}`);
    almacen.registrarAccion('respaldar', `respaldo en ${destino}`);
}

function ejecutarExportar(args) {
    const destino = args[0] || os.homedir();
    const resultado = notas.exportarNotas(destino);

    if (!resultado.exportado) {
        console.log(resultado.motivo);
        almacen.registrarAccion('exportar', `error: ${resultado.motivo}`);
        return;
    }

    console.log(`Exportacion lista en ${resultado.destino} (${resultado.total} notas).`);
    almacen.registrarAccion('exportar', `archivo movido a ${resultado.destino}`);
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
            return ejecutarRespaldar(args);
        case 'exportar':
            return ejecutarExportar(args);
        case 'ayuda':
            mostrarAyuda();
            almacen.registrarAccion('ayuda', 'ayuda mostrada');
            return;
        default:
            if (comando) {
                console.log(`El comando "${comando}" no existe.`);
            }
            mostrarAyuda();
            almacen.registrarAccion(comando || 'sin comando', 'comando desconocido o ausente');
    }
}

try {
    main();
} catch (error) {
    console.error(`Ocurrio un error: ${error.message}`);
}
