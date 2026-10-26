# fechas-bitacora-samuelpalaciohoyos

Paquete de fechas para la bitacora: marca de tiempo, fecha larga y fecha corta, usando el formato de un idioma (por defecto `es-ES`).

## Instalacion

```bash
npm install fechas-bitacora-samuelpalaciohoyos
```

## Uso

```js
const { getTimeStamp, getLongTime, getShortDate } = require('fechas-bitacora-samuelpalaciohoyos');

const marca = getTimeStamp();               // 1793045946471
const larga = getLongTime();                // jueves, 22 de octubre de 2026, 10:15:30 GMT-5
const corta = getShortDate('es-ES', marca); // 22/10/2026
```

### API

| Funcion | Devuelve |
| --- | --- |
| `getTimeStamp()` | La marca de tiempo actual (numero). |
| `getLongTime(locale = 'es-ES', timestamp = Date.now())` | Fecha larga formateada. |
| `getShortDate(locale = 'es-ES', timestamp = Date.now())` | Fecha corta, por ejemplo `22/10/2026`. |
