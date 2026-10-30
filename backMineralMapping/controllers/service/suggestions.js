const pool = require('../../database.js');

/**
 * Suggère des substances à partir des lithologies (mot1/mot2) croisées avec prop_subs.
 */
async function suggestSubstancesFromLitho(lithoRows, { limit = 15 } = {}) {
    const tokens = new Set();
    for (const row of lithoRows || []) {
        for (const field of [row.mot1, row.mot2, row.lithology]) {
            String(field || '')
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length >= 3)
                .forEach((s) => tokens.add(s));
        }
    }
    if (!tokens.size) {
        return { suggestions: [], message: 'Aucune lithologie pour suggérer des substances' };
    }

    const list = [...tokens].slice(0, 40);
    const result = await pool.query(
        `SELECT DISTINCT ps.subs AS nom, ps.idprop
         FROM prop_subs ps
         WHERE EXISTS (
            SELECT 1 FROM unnest($1::text[]) AS t(tok)
            WHERE ps.subs ILIKE '%' || t.tok || '%'
               OR t.tok ILIKE '%' || ps.subs || '%'
         )
         ORDER BY ps.subs
         LIMIT $2`,
        [list, Math.min(Number(limit) || 15, 40)]
    );

    return {
        tokensUsed: list.length,
        suggestions: result.rows.map((r) => ({
            nom: r.nom,
            nature: Number(r.idprop),
            reason: 'correspondance lithologie ↔ prop_subs',
        })),
    };
}

module.exports = { suggestSubstancesFromLitho };
