// Modèle pour les substances (peut être étendu selon les besoins)
class Substance {
    constructor(id, name, type, description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
    }
}

module.exports = Substance;
