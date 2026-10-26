const hash = require('object-hash');
const FechaActual = require('./fechas');

class Data {
    #id;
    #texto;
    #etiqueta;
    #fecha;

    constructor(id = null, texto = '', etiqueta = '', fecha = FechaActual) {
        this.#id = id;
        this.#texto = texto;
        this.#etiqueta = etiqueta;
        this.#fecha = fecha;


        if (!this.#id) {
            this.ConstruirHash();
        }
    }

    ConstruirHash() {
        const payload = { texto: this.#texto, etiqueta: this.#etiqueta, fecha: this.#fecha };
        this.#id = hash(payload);
        return this.#id;
    }

    toObject() {
        return {
            id: this.#id,
            texto: this.#texto,
            etiqueta: this.#etiqueta,
            fecha: this.#fecha
        };
    }

    toJSON() {
        return JSON.stringify(this.toObject(), null, 2);
    }

    get id() { return this.#id; }
    get texto() { return this.#texto; }
    get etiqueta() { return this.#etiqueta; }
    get fecha() { return this.#fecha; }

    set texto(texto) { this.#texto = texto; }
    set etiqueta(etiqueta) { this.#etiqueta = etiqueta; }
    set fecha(fecha) { this.#fecha = fecha; }
}

module.exports = Data;
