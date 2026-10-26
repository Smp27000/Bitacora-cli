// Paquete de fechas para la bitacora (CommonJS).

// Marca de tiempo actual (numero de milisegundos).
function getTimeStamp() {
    return Date.now();
}

// Fecha larga: "lunes, 22 de octubre de 2026, 10:15:30 GMT-5".
// Formatea el timestamp que reciba; si no recibe ninguno usa el momento actual.
function getLongTime(locale = 'es-ES', timestamp = Date.now()) {
    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
    };
    return new Date(timestamp).toLocaleString(locale, opciones);
}

// Fecha corta: "22/10/2026".
function getShortDate(locale = 'es-ES', timestamp = Date.now()) {
    return new Date(timestamp).toLocaleDateString(locale);
}

module.exports = {
    getTimeStamp,
    getLongTime,
    getShortDate
};
