// Modulo local de fechas (Parte 2 y 3).
// En la Parte 4 este archivo se reemplaza por el paquete fechas-bitacora-samuelpalaciohoyos.

function getTimeStamp() {
    return Date.now();
}

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

function getShortDate(locale = 'es-ES', timestamp = Date.now()) {
    return new Date(timestamp).toLocaleDateString(locale);
}

module.exports = {
    getTimeStamp,
    getLongTime,
    getShortDate
};
