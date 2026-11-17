import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { BarChart } from '@mui/x-charts/BarChart';
import axiosInstance from '../../Lesmomdules/axiosInstance';
import { bcmm } from '../../theme/bcmm';
import TerrainObsMap from './TerrainObsMap';

/** Grille IHM 8px : 8 / 16 / 24 */
const space = {
  xs: 1,   // 8
  sm: 1.5, // 12
  md: 2,   // 16
  lg: 3,   // 24
};

function KpiCard({ label, value, hint }) {
  return (
    <Box
      sx={{
        p: space.md,
        border: `1px solid ${bcmm.surface.border}`,
        borderRadius: `${bcmm.radius.sm}px`,
        backgroundColor: bcmm.surface.card,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.33,
          color: bcmm.ink.muted,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          mt: space.xs,
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.15,
          color: bcmm.ink.title,
          fontFamily: bcmm.font.sans,
        }}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography
          sx={{
            mt: space.xs,
            fontSize: 13,
            lineHeight: 1.4,
            color: bcmm.ink.muted,
          }}
        >
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        p: space.md,
        border: `1px solid ${bcmm.surface.border}`,
        borderRadius: `${bcmm.radius.sm}px`,
        backgroundColor: bcmm.surface.card,
      }}
    >
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.35,
          color: bcmm.ink.title,
        }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          sx={{
            mt: 0.5,
            mb: space.md,
            fontSize: 13,
            lineHeight: 1.4,
            color: bcmm.ink.muted,
          }}
        >
          {subtitle}
        </Typography>
      ) : (
        <Box sx={{ mb: space.md }} />
      )}
      {children}
    </Box>
  );
}

export default function TableauDeBord() {
  const [stats, setStats] = React.useState(null);
  const [terrain, setTerrain] = React.useState({ resume: null, observations: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [dash, decision] = await Promise.all([
          axiosInstance.get('/admin/dashboardStats'),
          axiosInstance.get('/api/decision/dashboard').catch(() => null),
        ]);
        if (cancelled) return;
        setStats(dash.data || {});
        if (decision?.data) {
          setTerrain({
            resume: decision.data.terrainResume || null,
            observations: decision.data.observationsTerrain || [],
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.erreur || 'Impossible de charger le tableau de bord');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const topSubstances = Array.isArray(stats?.topSubstances) ? stats.topSubstances : [];
  const repartition = Array.isArray(stats?.repartitionNotes) ? stats.repartitionNotes : [];
  const today = Number(stats?.evaluationsAujourdhui ?? 0);
  const topCount = topSubstances.reduce((acc, row) => acc + Number(row.n || 0), 0);
  const notesCount = repartition.reduce((acc, row) => acc + Number(row.n || 0), 0);
  const terrainTotal = Number(terrain.resume?.total ?? terrain.observations.length ?? 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: space.lg }}>
        <CircularProgress size={28} sx={{ color: bcmm.brand.primary }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: space.md,
        alignItems: 'stretch',
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.3,
            color: bcmm.ink.title,
            fontFamily: bcmm.font.sans,
          }}
        >
          Tableau de bord
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: 13,
            lineHeight: 1.4,
            color: bcmm.ink.muted,
          }}
        >
          Activité d&apos;évaluation Mineral Mapping (BCMM)
        </Typography>
      </Box>

      {error ? <Alert severity="error" sx={{ py: 1 }}>{error}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: space.md,
          width: '100%',
        }}
      >
        <KpiCard
          label="Évaluations aujourd'hui"
          value={today}
          hint="Demandes traitées sur la journée"
        />
        <KpiCard
          label="Top substances"
          value={topSubstances.length}
          hint={`${topCount} occurrences cumulées`}
        />
        <KpiCard
          label="Notes enregistrées"
          value={notesCount}
          hint="Répartition ScoreEngine 1 à 4"
        />
        <KpiCard
          label="Observations terrain"
          value={terrainTotal}
          hint={`${terrain.resume?.avecCoordonnees ?? 0} géolocalisées · ${terrain.resume?.avecPhoto ?? 0} avec photo`}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.35fr) minmax(280px, 1fr)',
          },
          gap: space.md,
          width: '100%',
          alignItems: 'start',
        }}
      >
        <Panel
          title="Substances les plus demandées"
          subtitle="5 substances les plus fréquentes dans l'historique"
        >
          {topSubstances.length === 0 ? (
            <Typography sx={{ color: bcmm.ink.muted, fontSize: 13, lineHeight: 1.4 }}>
              Aucune donnée substance pour le moment.
            </Typography>
          ) : (
            <BarChart
              height={260}
              margin={{ left: 88, right: 8, top: 4, bottom: 24 }}
              yAxis={[{
                scaleType: 'band',
                data: topSubstances.map((r) => r.substance || 'n/a'),
                tickLabelStyle: { fontSize: 12, fill: bcmm.ink.body },
                disableLine: true,
                disableTicks: true,
              }]}
              xAxis={[{
                tickLabelStyle: { fontSize: 11, fill: bcmm.ink.muted },
                disableLine: true,
                disableTicks: true,
              }]}
              series={[{
                data: topSubstances.map((r) => Number(r.n || 0)),
                color: bcmm.brand.primary,
              }]}
              layout="horizontal"
              grid={{ vertical: true, horizontal: false }}
              slotProps={{ legend: { hidden: true } }}
              sx={{
                width: '100%',
                '& .MuiChartsAxis-line': { stroke: 'transparent' },
                '& .MuiChartsAxis-tick': { stroke: 'transparent' },
                '& .MuiChartsLegend-root': { display: 'none' },
                '& .MuiChartsGrid-line': { stroke: bcmm.surface.border },
              }}
            />
          )}
        </Panel>

        <Panel
          title="Répartition des notes"
          subtitle="Score métier ScoreEngine"
        >
          {repartition.length === 0 ? (
            <Typography sx={{ color: bcmm.ink.muted, fontSize: 13, lineHeight: 1.4 }}>
              Aucune répartition disponible.
            </Typography>
          ) : (
            <Box
              component="ul"
              sx={{
                m: 0,
                p: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: space.sm,
              }}
            >
              {repartition.map((row) => {
                const n = Number(row.n || 0);
                const pct = notesCount ? Math.round((100 * n) / notesCount) : 0;
                return (
                  <Box component="li" key={String(row.label)}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: space.md,
                        mb: 0.75,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          color: bcmm.ink.body,
                          textTransform: 'capitalize',
                        }}
                      >
                        {row.label || 'n/a'}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 13,
                          lineHeight: 1.3,
                          color: bcmm.ink.muted,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n} ({pct}%)
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 6,
                        borderRadius: 0.5,
                        backgroundColor: bcmm.surface.canvas,
                        overflow: 'hidden',
                      }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${row.label || 'note'}: ${pct}%`}
                    >
                      <Box
                        sx={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: bcmm.brand.primary,
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Panel>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.2fr) minmax(260px, 1fr)',
          },
          gap: space.md,
          width: '100%',
          alignItems: 'start',
        }}
      >
        <Panel
          title="Carte des observations terrain"
          subtitle="Points synchronisés depuis mmtrace (mobile)"
        >
          {terrain.observations.length === 0 ? (
            <Typography sx={{ color: bcmm.ink.muted, fontSize: 13, lineHeight: 1.4 }}>
              Aucune observation terrain pour le moment.
            </Typography>
          ) : (
            <TerrainObsMap observations={terrain.observations} height={280} />
          )}
        </Panel>
        <Panel
          title="Dernières observations"
          subtitle="Flux terrain récent"
        >
          {terrain.observations.length === 0 ? (
            <Typography sx={{ color: bcmm.ink.muted, fontSize: 13, lineHeight: 1.4 }}>
              En attente de sync mobile.
            </Typography>
          ) : (
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: space.sm }}>
              {terrain.observations.slice(0, 8).map((o) => (
                <Box
                  component="li"
                  key={o.id}
                  sx={{
                    py: 0.75,
                    borderBottom: `1px solid ${bcmm.surface.border}`,
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: bcmm.ink.body }}>
                    {o.substance || 'Sans substance'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: bcmm.ink.muted }}>
                    {Number.isFinite(Number(o.lat)) ? `${Number(o.lat).toFixed(4)}, ${Number(o.lon).toFixed(4)}` : 'Sans GPS'}
                    {o.synced_at ? ` · ${new Date(o.synced_at).toLocaleString()}` : ''}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Panel>
      </Box>
    </Box>
  );
}
