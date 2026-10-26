# bitacora-cli

Aplicacion de consola para llevar un registro diario de lo que aprendes, sin salir de la terminal.
Guarda las notas en un archivo JSON, evita guardar notas repetidas, genera respaldos, exporta un
archivo de texto legible y deja una bitacora de cada accion ejecutada.

## Instalacion

```bash
npm install
```

> El modulo de fechas vive en un paquete propio (`fechas-bitacora-samuelpalaciohoyos`) que se enlaza
> en local con `npm link`. Si el paquete no esta publicado todavia:
>
> ```bash
> cd ../fechas-bitacora-samuelpalaciohoyos
> npm link
> cd ../Taller1
> npm link fechas-bitacora-samuelpalaciohoyos
> ```

## Uso

Todos los comandos se ejecutan con `npm start -- <comando>`:

| Comando | Que hace |
| --- | --- |
| `agregar "<texto>" [etiqueta]` | Guarda una nota. La etiqueta es opcional (por defecto `general`). |
| `listar [N]` | Muestra las ultimas N notas (por defecto 5). |
| `buscar <palabra>` | Muestra las notas cuyo texto contiene la palabra (sin distinguir mayusculas). |
| `borrar <id>` | Elimina la nota con ese id. |
| `respaldar` | Copia `data/notas.json` a `respaldos/notas_<marca-de-tiempo>.json`. |
| `exportar [carpeta-destino]` | Crea `exportacion.txt` y lo mueve a esa carpeta (por defecto la carpeta personal). |
| `ayuda` | Muestra la ayuda. Tambien aparece si no escribes comando o si el comando no existe. |

### Ejemplos

```bash
npm start -- agregar "Hoy aprendi a usar fs" nodejs
npm start -- agregar "Hoy aprendi a usar fs" nodejs   # no se guarda: esta repetida
npm start -- listar 3
npm start -- buscar fs
npm start -- borrar 3f9a1c2e
npm start -- respaldar
npm start -- exportar /Users/tu-usuario/Desktop
npm start -- ayuda
```

### Estructura

```
bitacora-cli/
├── src/
│   ├── index.js      # lee los argumentos y decide que comando ejecutar
│   ├── notas.js      # logica: agregar, listar, buscar, borrar, respaldar, exportar
│   └── almacen.js    # lectura/escritura con fs (notas.json, bitacora.log, copias)
├── data/             # se crea al ejecutar (ignorada por Git)
├── respaldos/        # se crea al respaldar (ignorada por Git)
├── salida/           # carpeta temporal de exportacion (ignorada por Git)
└── package.json
```

## Reflexion

**¿Por que elegiste CommonJS o ES Modules? ¿Que cambio en tu package.json y en la forma de importar?**
Elegi CommonJS porque el proyecto ya venia configurado asi y porque el paquete de fechas que debo
consumir tambien es CommonJS; de esa forma todo el taller queda consistente y no necesito
interoperabilidad entre sistemas. En `package.json` basta con `"type": "commonjs"` y el `main`
apuntando a `src/index.js`. Al importar uso `require(...)` y `module.exports` en lugar de
`import`/`export`, y no necesito cambiar extensiones a `.mjs`.

**fs, object-hash y fechas (tu paquete) se importan distinto del modulo local notas.js. ¿Cual es la diferencia y como decide Node donde buscar cada uno?**
`require('./notas')` empieza por `./`, asi que Node lo trata como una ruta a un archivo del proyecto.
`require('fs')` es un modulo nativo: Node lo toma de su nucleo y nunca mira `node_modules`.
`require('object-hash')` y `require('fechas-bitacora-samuelpalaciohoyos')` son externos: Node sube
carpeta por carpeta buscando un `node_modules` que los contenga y lee su `package.json` (`main`)
para saber cual es el archivo de entrada. La regla es simple: con `./`, `../` o `/` es una ruta; sin
nada de eso, es un modulo nativo o un paquete.

**¿Por que data/notas.json se resuelve distinto si ejecutas el programa desde otra carpeta?**
Porque una ruta relativa se calcula desde el directorio de trabajo (`process.cwd()`), no desde el
archivo que se ejecuta. Si entras a `src` y corres `node index.js`, `"data/notas.json"` apuntaria a
`src/data/notas.json`, que no es el mismo archivo. Por eso en `almacen.js` armo las rutas con
`path.join(__dirname, '..', 'data')`: parten de la ubicacion real del archivo y dan el mismo
resultado desde cualquier carpeta.

**¿Por que node_modules/ no se sube a Git y como recupera otra persona las dependencias?**
Porque son miles de archivos que se pueden reinstalar desde la red y harian el repositorio enorme;
por eso `.gitignore` lo excluye. Lo que si se sube es `package.json` y `package-lock.json`, que
registran que dependencias y que versiones necesita el proyecto. Otra persona clona el repositorio y
ejecuta `npm install` para descargarlas exactamente iguales.

**¿Que diferencia viste al importar tu paquete CommonJS desde tu proyecto?**
Antes `fechas.js` era un modulo local y se importaba con `require('./fechas')`; al convertirlo en
paquete la ruta paso a `require('fechas-bitacora-samuelpalaciohoyos')`, sin `./`, porque ahora se
busca en `node_modules` (en mi caso, un enlace de `npm link`). Las llamadas a las funciones no
cambiaron, asi que migrar fue solo cambiar la ruta y borrar `src/fechas.js`. Un detalle importante:
al ser CommonJS, `module.exports` se puede importar tambien desde un proyecto ES Modules con
`import fechas from 'fechas-bitacora-samuelpalaciohoyos'` (Node expone `module.exports` como el
export por defecto), por lo que el paquete sirve en los dos sistemas.
