function FechaActual() {
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth();
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
}

module.exports = FechaActual;