import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Button from '@mui/material/Button';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const noteLabel = (res) => {
    const n = Number(res);
    if (n === 1) return 'nulle';
    if (n === 2) return 'faible';
    if (n === 3) return 'moyenne';
    if (n === 4) return 'élevée';
    return 'indeterminee';
};

const ExportPDF = (props) => {
    const {
        nomPersonne, selectPermis, selectedValue, listeCarre, nomFichier,
        choixSubs, resultat, conflits, meta,
    } = props;

    const generatePDF = () => {
        const doc = new jsPDF();
        const mouvement = selectedValue === '10' ? 'Renouvellement' : 'Octroie';
        const rows = Array.isArray(resultat) ? [...resultat] : [];
        rows.sort((a, b) => Number(b.result) - Number(a.result));
        const nb = parseInt(selectedValue, 10);
        const selected = Number.isFinite(nb) && nb < rows.length ? rows.slice(0, nb) : rows;
        const tableRows = selected.map((el) => [
            el.subs,
            el.label || noteLabel(el.result),
            noteLabel(el.presenceIndice ?? el.probIndice),
            el.path || '',
            (el.basesMatched || []).join(', '),
            (el.reason || '').slice(0, 80),
        ]);

        doc.setFontSize(16);
        doc.text("Dossier d'évaluation / instruction", 14, 12);
        doc.setFontSize(10);
        doc.text(`Titulaire: ${nomPersonne || ''}`, 10, 22);
        doc.text(`Permis: ${selectPermis?.typepermis || selectPermis?.libelle || ''} · ${mouvement}`, 10, 28);
        doc.text(`Carrés: ${listeCarre?.length || 0} · Substances: ${choixSubs?.length || 0} · CSV: ${nomFichier || '—'}`, 10, 34);
        doc.text(`Historique: ${meta?.historiqueId ?? '—'} · Lithologies: ${meta?.lithologieCount ?? '—'}`, 10, 40);
        if (conflits?.bloquant) {
            doc.setTextColor(180, 0, 0);
            doc.text(`BLOQUANT: ${conflits.message}`, 10, 46);
            doc.setTextColor(0, 0, 0);
        } else {
            doc.text(`Conflits: ${conflits?.message || 'non scannés'}`, 10, 46);
        }

        doc.autoTable({
            startY: 52,
            head: [['substance', 'lithologie', 'indices', 'chemin', 'bases', 'justification']],
            body: tableRows,
            theme: 'plain',
            styles: { fontSize: 7 },
        });
        doc.save(`${nomPersonne || 'dossier'}_instruction.pdf`);
    };

    return (
        <Button variant="contained" endIcon={<PictureAsPdfIcon />} size="large" onClick={generatePDF} sx={{ ml: 1 }}>
            Dossier PDF
        </Button>
    );
};

export default ExportPDF;
