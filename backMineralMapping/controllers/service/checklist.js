/**
 * Checklist métier avant évaluation / envoi dossier.
 */
function runChecklist(donneesTableau) {
    const checks = [];
    const push = (id, ok, message, blocking = true) => {
        checks.push({ id, ok: Boolean(ok), message, blocking });
    };

    const nom = (donneesTableau?.nomPersonne || '').toString().trim();
    push('demandeur', nom.length > 0, 'Nom du demandeur renseigné');

    const permisId = donneesTableau?.selectPermis;
    push('permis', permisId !== undefined && permisId !== null && permisId !== '', 'Type de permis sélectionné');

    const carres = Array.isArray(donneesTableau?.listeCarre) ? donneesTableau.listeCarre : [];
    push('carres', carres.length > 0, `Au moins un carré (${carres.length})`);

    const hors = carres.filter((c) => Number(c.etat) === 1);
    push('hors_decoupe', hors.length === 0, hors.length ? `${hors.length} carré(s) hors découpe` : 'Tous les carrés dans la découpe');

    const subs = Array.isArray(donneesTableau?.choixSubs) ? donneesTableau.choixSubs : [];
    push('substances', subs.length > 0, `Au moins une substance (${subs.length})`);

    const blockingFails = checks.filter((c) => c.blocking && !c.ok);
    return {
        ok: blockingFails.length === 0,
        blockingFails: blockingFails.map((c) => c.id),
        checks,
    };
}

module.exports = { runChecklist };
