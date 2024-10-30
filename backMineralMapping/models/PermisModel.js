// Modèle pour les permis (peut être étendu selon les besoins)
class Permis {
    constructor(id, type, description, geom) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.geom = geom;
    }
}

module.exports = Permis;
