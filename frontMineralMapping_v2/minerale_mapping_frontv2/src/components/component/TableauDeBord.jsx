import * as React from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';

const chartSetting = {
    xAxis: [
        {
            label: 'nb demande',
        },
    ],
    width: 800,
    height: 500,
};
const dataset = [
    {
        london: 59,
        paris: 57,
        newYork: 86,
        seoul: 21,
        month: 'Rubis',
    },
    {
        london: 50,
        paris: 52,
        newYork: 78,
        seoul: 28,
        month: 'Béryl',
    },
    {
        london: 47,
        paris: 53,
        newYork: 106,
        seoul: 41,
        month: 'Graphite',
    },
    {
        london: 54,
        paris: 56,
        newYork: 92,
        seoul: 73,
        month: 'Cuivre',
    },
    {
        london: 57,
        paris: 69,
        newYork: 92,
        seoul: 99,
        month: 'Quartz',
    },
];
const valueFormatter = (value) => `${value}fois`;

const DemoPaper = styled(Paper)(({ theme }) => ({
    width: 450,
    height: 130,
    padding: theme.spacing(2),
    ...theme.typography.body2,
    textAlign: 'center',
}));

export default function SquareCorners() {
    return (
        <div>
            <Typography variant="h4" gutterBottom style={{ color: 'rgb(43, 102, 147)' }}>
                Tableau de bord
            </Typography>
            <Stack direction="row" spacing={2}>
                <DemoPaper square={false}>
                    <Typography variant="h5" gutterBottom style={{ color: 'blue' }}>
                        Nombre d'évaluation aujourd'hui
                    </Typography>
                    <Typography variant="h2" gutterBottom style={{ color: 'grey' }}>
                        3
                    </Typography>

                </DemoPaper>
                <DemoPaper square={false}>
                    <Typography variant="h5" gutterBottom style={{ color: 'blue' }}>
                        Nombre d'évaluation cette Semaine
                    </Typography>
                    <Typography variant="h2" gutterBottom style={{ color: 'grey' }}>
                        5
                    </Typography>

                </DemoPaper>
                <DemoPaper square={false}>
                    <Typography variant="h5" gutterBottom style={{ color: 'blue' }}>
                        Nombre d'évaluation ce mois-ci
                    </Typography>
                    <Typography variant="h2" gutterBottom style={{ color: 'grey' }}>
                        10
                    </Typography>

                </DemoPaper>
            </Stack>
            <center style={{marginTop:'20px'}}>
                <BarChart
                    dataset={dataset}
                    yAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                    series={[{ dataKey: 'seoul', label: 'Nombre de demande', valueFormatter }]}
                    layout="horizontal"
                    {...chartSetting}
                />
                <Typography variant="h5" gutterBottom style={{ color: 'blue' }}>
                        Top 5 des substances les plus demandées
                    </Typography>
            </center>
        </div>
    );
}
