// ONEA-OPT PDF Export for Reports
// Generate optimization reports using jsPDF

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  (doc as any).autoTable({
    startY: 130,
    head: [['Métrique', 'Scénario Actuel', 'Scénario Optimisé', 'Économie']],
    body: [
      ['Coût journalier', `${data.currentCost.toLocaleString()} FCFA`, `${data.optimizedCost.toLocaleString()} FCFA`, `${data.savings.toLocaleString()} FCFA`],
      ['Coût annuel', `${(data.currentCost * 365).toLocaleString()} FCFA`, `${(data.optimizedCost * 365).toLocaleString()} FCFA`, `${(data.savings * 365).toLocaleString()} FCFA`],
      ['Facteur de puissance (Cos φ)', '0.89', data.cosPhi.toFixed(2), `${data.penaltyAvoided.toLocaleString()} FCFA/jour`],
      ['Émissions CO₂', '-', '-', `${data.co2Saved} kg/jour`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });
  
  // Planning 24h table
  const planningBody = data.planning24h.map((pumps, hour) => [
    `${hour.toString().padStart(2, '0')}h00`,
    data.demand24h[hour]?.toLocaleString() || '-',
    pumps.toString(),
    `${data.tariffs24h[hour]} FCFA/kWh`,
    pumps > 0 ? 'Actif' : 'Arrêt'
  ]);
  
  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['Heure', 'Demande (m³)', 'Pompes Actives', 'Tarif', 'Statut']],
    body: planningBody,
    theme: 'grid',
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9 }
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
