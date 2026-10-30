/**
 * Smoke tests API Mineral Mapping (Phase 5).
 * Prérequis: serveur démarré (npm start) + DB mineral_mapping.
 * Usage: npm run smoke
 */
require('dotenv').config();

const BASE = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;

async function req(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(options.cookie ? { Cookie: options.cookie } : {}),
        },
    });
    const setCookie = res.headers.getSetCookie?.() || [];
    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch {
        json = { _raw: text };
    }
    return { status: res.status, json, setCookie, headers: res.headers };
}

function cookieJar(setCookie) {
    return setCookie.map((c) => c.split(';')[0]).join('; ');
}

async function main() {
    const fails = [];
    const ok = (name) => console.log(`OK  ${name}`);
    const fail = (name, detail) => {
        console.error(`FAIL ${name}: ${detail}`);
        fails.push(name);
    };

    // 1) Health
    try {
        const health = await req('/health');
        if (health.status === 200 && health.json.ok) ok('health');
        else fail('health', `status ${health.status}`);
    } catch (e) {
        fail('health', e.message);
        console.error('Serveur injoignable. Lancez: npm start dans backMineralMapping');
        process.exit(1);
    }

    // 2) Login admin
    let cookie = '';
    try {
        const login = await req('/sendDatalogin', {
            method: 'POST',
            body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        });
        cookie = cookieJar(login.setCookie);
        if (login.status === 200 && login.json && !login.json.erreur && (login.json.role || login.json.redirect || login.json.id)) {
            ok('login_admin');
        } else {
            fail('login_admin', JSON.stringify(login.json).slice(0, 200));
        }
    } catch (e) {
        fail('login_admin', e.message);
    }

    // 3) Dashboard stats (admin)
    try {
        const dash = await req('/admin/dashboardStats', { cookie });
        if (dash.status === 200 && typeof dash.json.evaluationsAujourdhui === 'number') {
            ok('dashboard_stats');
        } else {
            fail('dashboard_stats', `status=${dash.status} ${JSON.stringify(dash.json).slice(0, 160)}`);
        }
    } catch (e) {
        fail('dashboard_stats', e.message);
    }

    // 3b) Couche permis
    try {
        const layer = await req('/utilisateur/permisLayer', { cookie });
        if (layer.status === 200 && layer.json.layer) ok(`permis_layer (${layer.json.layer})`);
        else fail('permis_layer', `status=${layer.status}`);
    } catch (e) {
        fail('permis_layer', e.message);
    }

    // 4) Historique
    try {
        const hist = await req('/admin/getHistoriques', { cookie });
        if (hist.status === 200 && Array.isArray(hist.json)) {
            ok(`historique (${hist.json.length} entrées)`);
        } else {
            fail('historique', `status=${hist.status}`);
        }
    } catch (e) {
        fail('historique', e.message);
    }

    // 5) Krigeage (peut échouer métier si peu de points — endpoint doit répondre 200 ou 400/401)
    try {
        const kr = await req('/api/analyse/krigeage', {
            method: 'POST',
            cookie,
            body: JSON.stringify({ substance: 'Nickel', newx: 47.5, newy: -18.9 }),
        });
        if (kr.status === 200 && kr.json.type === 'krigeage' && kr.json.horsScorePermis === true) {
            ok('krigeage_endpoint');
        } else if (kr.status === 401) {
            fail('krigeage_endpoint', 'non authentifié (cookie session?)');
        } else {
            fail('krigeage_endpoint', `status=${kr.status} ${JSON.stringify(kr.json).slice(0, 160)}`);
        }
    } catch (e) {
        fail('krigeage_endpoint', e.message);
    }

    // 6) Evaluation hors-découpe rejetée
    try {
        const bad = await req('/utilisateur/getDonneDemande', {
            method: 'POST',
            cookie,
            body: JSON.stringify({
                donneesTableau: {
                    nomPersonne: 'Smoke',
                    selectPermis: 1,
                    listeCarre: [{ etat: 1, x: 0, y: 0 }],
                    choixSubs: [1],
                },
            }),
        });
        if (bad.status === 400 && /hors/i.test(String(bad.json.error || ''))) {
            ok('hors_decoupe_reject');
        } else {
            fail('hors_decoupe_reject', `status=${bad.status} ${JSON.stringify(bad.json).slice(0, 160)}`);
        }
    } catch (e) {
        fail('hors_decoupe_reject', e.message);
    }

    // 7) Checklist API
    try {
        const cl = await req('/api/decision/checklist', {
            method: 'POST',
            cookie,
            body: JSON.stringify({
                donneesTableau: {
                    nomPersonne: 'Smoke',
                    selectPermis: 1,
                    listeCarre: [{ etat: 0 }],
                    choixSubs: [1],
                },
            }),
        });
        if (cl.status === 200 && cl.json.ok === true) ok('checklist_api');
        else fail('checklist_api', `status=${cl.status}`);
    } catch (e) {
        fail('checklist_api', e.message);
    }

    // 8) Instruction — list + create dossier
    try {
        const list = await req('/api/instruction/dossiers', { cookie });
        if (list.status === 200 && Array.isArray(list.json.dossiers || list.json)) {
            ok('instruction_list');
        } else {
            fail('instruction_list', `status=${list.status} ${JSON.stringify(list.json).slice(0, 160)}`);
        }
    } catch (e) {
        fail('instruction_list', e.message);
    }

    try {
        const created = await req('/api/instruction/dossiers', {
            method: 'POST',
            cookie,
            body: JSON.stringify({
                titre: `Smoke ${Date.now()}`,
                demandeur: 'Smoke Tester',
                payload: { source: 'smoke' },
            }),
        });
        if ((created.status === 200 || created.status === 201) && created.json.ok && created.json.dossier?.id) {
            ok(`instruction_create (id=${created.json.dossier.id})`);
        } else {
            fail('instruction_create', `status=${created.status} ${JSON.stringify(created.json).slice(0, 160)}`);
        }
    } catch (e) {
        fail('instruction_create', e.message);
    }

    // 9) Validation métier — fixtures + feedback list
    try {
        const fx = await req('/api/validation/fixtures', { cookie });
        if (fx.status === 200 && Array.isArray(fx.json.results) && typeof fx.json.total === 'number') {
            ok(`validation_fixtures (${fx.json.passed}/${fx.json.total})`);
        } else {
            fail('validation_fixtures', `status=${fx.status} ${JSON.stringify(fx.json).slice(0, 160)}`);
        }
    } catch (e) {
        fail('validation_fixtures', e.message);
    }

    try {
        const fb = await req('/api/validation/feedback', { cookie });
        if (fb.status === 200 && Array.isArray(fb.json.feedback)) ok('validation_feedback_list');
        else fail('validation_feedback_list', `status=${fb.status} ${JSON.stringify(fb.json).slice(0, 160)}`);
    } catch (e) {
        fail('validation_feedback_list', e.message);
    }

    // 10) Conflits avec couche + seuil (petit polygone Madagascar)
    try {
        const cf = await req('/api/decision/conflits', {
            method: 'POST',
            cookie,
            body: JSON.stringify({
                geojson: {
                    type: 'MultiPolygon',
                    coordinates: [[
                        [
                            [47.5, -18.9],
                            [47.51, -18.9],
                            [47.51, -18.91],
                            [47.5, -18.91],
                            [47.5, -18.9],
                        ],
                    ]],
                },
                layer: 'permis_shp',
                blockingOverlapM2: 100,
            }),
        });
        if (cf.status === 200 && typeof cf.json.count === 'number') {
            ok(`conflits_layer_seuil (count=${cf.json.count})`);
        } else {
            fail('conflits_layer_seuil', `status=${cf.status} ${JSON.stringify(cf.json).slice(0, 160)}`);
        }
    } catch (e) {
        fail('conflits_layer_seuil', e.message);
    }

    if (fails.length) {
        console.error(`\nSmoke: ${fails.length} échec(s)`);
        process.exit(1);
    }
    console.log('\nSmoke: tous les contrôles passés');
}

main();
