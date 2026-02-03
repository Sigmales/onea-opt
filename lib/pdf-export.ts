// ONEA-OPT PDF Export for Reports
// Generate optimization reports using jsPDF

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import algorithm configs
import { exportAlgorithmConfig as exportNSGA2Config } from './algorithms/nsga2';
import { exportIsolationForestConfig } from './algorithms/isolation-forest';
import { exportDemandPredictorConfig } from './algorithms/demand-predictor';

export interface PDFReportData {
  stationName: string;
  date: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercent: number;
  planning24h: number[];
  demand24h: number[];
  tariffs24h: number[];
  cosPhi: number;
  penaltyAvoided: number;
  co2Saved: number;
  paretoFront?: { cost: number; stability: number }[];
}

// Generate optimization report PDF
export async function generateOptimizationReport(
  data: PDFReportData
): Promise<Blob> {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(0, 102, 204);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('ONEA-OPT', 20, 25);
  doc.setFontSize(14);
  doc.text('Rapport d\'Optimisation Énergétique', 20, 35);

  // Station info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Station: ${data.stationName}`, 20, 55);
  doc.text(`Date: ${data.date}`, 20, 62);

  // Summary box
  doc.setFillColor(240, 249, 244);
  doc.roundedRect(15, 70, 180, 50, 5, 5, 'F');

  doc.setFontSize(16);
  doc.setTextColor(32, 175, 36);
  doc.text('Économies Réalisées', 25, 85);

  doc.setFontSize(28);
  doc.text(`${data.savings.toLocaleString()} FCFA`, 25, 105);

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`(${data.savingsPercent}% de réduction)`, 25, 115);

  // Cost comparison table
  autoTable(doc, {
    startY: 130,
    head: [['Métrique', 'Scénario Actuel', 'Scénario Optimisé', 'Économie']],
    body: [
      ['Coût journalier', `${data.currentCost.toLocaleString('fr-FR')} FCFA`, `${data.optimizedCost.toLocaleString('fr-FR')} FCFA`, `${data.savings.toLocaleString('fr-FR')} FCFA`],
      ['Coût annuel', `${(data.currentCost * 365).toLocaleString('fr-FR')} FCFA`, `${(data.optimizedCost * 365).toLocaleString('fr-FR')} FCFA`, `${(data.savings * 365).toLocaleString('fr-FR')} FCFA`],
      ['Facteur de puissance (Cos φ)', '0.89', data.cosPhi.toFixed(2), `${data.penaltyAvoided.toLocaleString('fr-FR')} FCFA/j`],
      ['Émissions CO₂', '-', '-', `${data.co2Saved} kg/jour`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 50 },  // Métrique
      1: { cellWidth: 45 },  // Scénario Actuel
      2: { cellWidth: 45 },  // Scénario Optimisé
      3: { cellWidth: 45 }   // Économie
    }
  });

  // Planning 24h table
  const planningBody = data.planning24h.map((pumps, hour) => [
    `${hour.toString().padStart(2, '0')}h00`,
    data.demand24h[hour]?.toLocaleString() || '-',
    pumps.toString(),
    `${data.tariffs24h[hour]} FCFA/kWh`,
    pumps > 0 ? 'Actif' : 'Arrêt'
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['Heure', 'Demande (m³)', 'Pompes Actives', 'Tarif', 'Statut']],
    body: planningBody,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: {
      fontSize: 7,
      cellPadding: 1.5
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },  // Heure
      1: { cellWidth: 30, halign: 'right' },   // Demande
      2: { cellWidth: 30, halign: 'center' },  // Pompes Actives
      3: { cellWidth: 35, halign: 'right' },   // Tarif
      4: { cellWidth: 25, halign: 'center' }   // Statut
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ONEA-OPT - Rapport généré le ${new Date().toLocaleDateString('fr-FR')} - Page ${i}/${pageCount}`,
      20,
      285
    );
  }

  return doc.output('blob');
}

// Download PDF
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate and download optimization report
export async function exportOptimizationReport(data: PDFReportData): Promise<void> {
  const blob = await generateOptimizationReport(data);
  const filename = `ONEA-OPT-Rapport-${data.stationName}-${data.date}.pdf`;
  downloadPDF(blob, filename);
}

// ============================================================================
// DG DASHBOARD PDF EXPORT
// ============================================================================

export interface DGStationData {
  id: string;
  name: string;
  region: string;
  status: string;
  savings: number;
}

export interface DGMonthlyData {
  month: string;
  savings: number;
  cumulative: number;
}

export interface DGInitiativeData {
  id: string;
  name: string;
  budget: number;
  roi: string;
  priority: number;
  impact: string;
  status: string;
}

export interface DGBudgetData {
  current: number;
  optimized: number;
  freed: number;
  reallocation: { name: string; amount: number; color: string }[];
}

export interface DGReportData {
  stations: DGStationData[];
  monthlySavings: DGMonthlyData[];
  initiatives: DGInitiativeData[];
  budget: DGBudgetData;
  metrics: {
    annualSavings: number;
    roi: string;
    co2Saved: number;
    adoptionRate: number;
  };
}

// Generate DG Executive Report PDF
export async function generateDGReport(data: DGReportData): Promise<Blob> {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.text('ONEA-OPT', 20, 25);
  doc.setFontSize(16);
  doc.text('Rapport Exécutif Direction Générale', 20, 35);

  // Date
  doc.setFontSize(10);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 150, 35);

  // Executive Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé Exécutif', 20, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Metrics boxes
  const metrics = [
    { label: 'Économies annuelles', value: `${(data.metrics.annualSavings / 1000000).toFixed(1)}M FCFA`, y: 70 },
    { label: 'ROI moyen', value: data.metrics.roi, y: 85 },
    { label: 'CO₂ évités/an', value: `${data.metrics.co2Saved} tonnes`, y: 100 },
    { label: 'Taux d\'adoption IA', value: `${data.metrics.adoptionRate}%`, y: 115 }
  ];

  metrics.forEach(m => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, m.y, 85, 10, 2, 2, 'F');
    doc.text(m.label, 23, m.y + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(m.value, 70, m.y + 7);
    doc.setFont('helvetica', 'normal');
  });

  // Stations Table
  autoTable(doc, {
    startY: 135,
    head: [['Station', 'Région', 'Statut', 'Économies (FCFA/an)']],
    body: data.stations.map(s => [
      s.name,
      s.region,
      s.status === 'optimized' ? 'Optimisé' :
        s.status === 'warning' ? 'Attention' : 'Action requise',
      s.savings > 0 ? `+${s.savings.toLocaleString('fr-FR')}` : s.savings.toLocaleString('fr-FR')
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 50, halign: 'right' }
    }
  });

  // New page for monthly savings
  doc.addPage();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Évolution Mensuelle des Économies', 20, 20);

  autoTable(doc, {
    startY: 30,
    head: [['Mois', 'Économies mensuelles', 'Cumulé']],
    body: data.monthlySavings.map(m => [
      m.month,
      `${m.savings.toLocaleString('fr-FR')} FCFA`,
      `${m.cumulative.toLocaleString('fr-FR')} FCFA`
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 9
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60, halign: 'right' },
      2: { cellWidth: 60, halign: 'right' }
    }
  });

  // Strategic Initiatives
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Initiatives Stratégiques', 20, (doc as any).lastAutoTable.finalY + 15);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Initiative', 'Budget', 'ROI', 'Impact', 'Priorité', 'Statut']],
    body: data.initiatives.map(i => [
      i.name,
      `${(i.budget / 1000000).toFixed(0)}M`,
      i.roi,
      i.impact,
      '★'.repeat(i.priority),
      i.status === 'approved' ? 'Approuvé' :
        i.status === 'pending' ? 'En attente' : 'En révision'
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 8
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 20 },
      3: { cellWidth: 35 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25 }
    }
  });

  // Budget Reallocation
  doc.addPage();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Réallocation Budgétaire', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const budgetY = 35;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, budgetY, 170, 30, 3, 3, 'F');

  doc.text(`Budget énergie actuel:`, 25, budgetY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${(data.budget.current / 1000000).toFixed(0)}M FCFA`, 80, budgetY + 10);

  doc.setFont('helvetica', 'normal');
  doc.text(`Après optimisation:`, 25, budgetY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(32, 175, 36);
  doc.text(`${(data.budget.optimized / 1000000).toFixed(0)}M FCFA`, 80, budgetY + 20);

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(32, 175, 36);
  doc.text(`${(data.budget.freed / 1000000).toFixed(0)}M FCFA libérés`, 120, budgetY + 15);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  autoTable(doc, {
    startY: budgetY + 40,
    head: [['Poste de réallocation', 'Montant']],
    body: data.budget.reallocation.map(r => [
      r.name,
      `${(r.amount / 1000000).toFixed(0)}M FCFA`
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: 'right' }
    }
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ONEA-OPT - Rapport DG - Page ${i}/${pageCount}`,
      20,
      285
    );
  }

  return doc.output('blob');
}

// Export DG Report
export async function exportDGReport(data: DGReportData): Promise<void> {
  const blob = await generateDGReport(data);
  const date = new Date().toISOString().split('T')[0];
  const filename = `ONEA-OPT-DG-Executive-${date}.pdf`;
  downloadPDF(blob, filename);
}

// Export algorithms as JSON files
export async function exportAlgorithmsJSON(): Promise<Record<string, any>> {
  return {
    'nsga2.json': exportNSGA2Config(),
    'isolation-forest.json': exportIsolationForestConfig(),
    'demand-predictor.json': exportDemandPredictorConfig()
  };
}

// Create ZIP with algorithm files
export async function createAlgorithmsZip(): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const algorithms = await exportAlgorithmsJSON();

  // Add each algorithm as JSON file
  for (const [filename, content] of Object.entries(algorithms)) {
    zip.file(filename, JSON.stringify(content, null, 2));
  }

  // Add README
  const readme = `# ONEA-OPT Algorithmes IA

Ce dossier contient les algorithmes d'intelligence artificielle utilisés par ONEA-OPT pour l'optimisation énergétique des stations de pompage d'eau.

## Fichiers

### nsga2.json
Algorithme NSGA-II (Non-dominated Sorting Genetic Algorithm II) pour l'optimisation multi-objectifs du planning de pompage.

### isolation-forest.json  
Algorithme Isolation Forest pour la détection non-supervisée d'anomalies et fuites.

### demand-predictor.json
Algorithme LSTM simplifié pour la prédiction de la demande en eau potable.

## Licence
MIT License - ONEA Burkina Faso
`;
  zip.file('README.md', readme);

  return zip.generateAsync({ type: 'blob' });
}

// Download algorithms ZIP
export async function downloadAlgorithmsZip(): Promise<void> {
  const blob = await createAlgorithmsZip();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ONEA-OPT-Algorithmes-IA.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
