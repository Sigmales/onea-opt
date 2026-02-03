// ONEA-OPT Excel Export for Regional Dashboard
// Generate Excel reports with multiple sheets

import * as XLSX from 'xlsx';

export interface StationData {
    id: string;
    name: string;
    capacity: string;
    consumption: number;
    consumptionTrend: number;
    costPerM3: number;
    savings: number;
    status: 'optimal' | 'warning' | 'critical';
    pumps: number;
    activePumps: number;
}

export interface EfficiencyData {
    name: string;
    efficiency: number;
    cost: number;
}

export interface LoadDistributionData {
    name: string;
    value: number;
    color: string;
}

export interface MonthlyTrendData {
    day: number;
    ziga: number;
    paspanga: number;
    loumbila: number;
    tampouy: number;
    ouaga2000: number;
}

export interface RegionalExportData {
    stations: StationData[];
    efficiencyRanking: EfficiencyData[];
    loadDistribution: LoadDistributionData[];
    monthlyTrend: MonthlyTrendData[];
    totalSavings: number;
    optimalStations: number;
    totalStations: number;
}

// Format station data for Excel
function formatStationsSheet(stations: StationData[]): any[][] {
    const headers = [
        'Station',
        'Capacité',
        'Consommation (kWh)',
        'Tendance (%)',
        'Coût/m³ (FCFA)',
        'Économies (FCFA/jour)',
        'État',
        'Pompes Totales',
        'Pompes Actives'
    ];

    const rows = stations.map(station => [
        station.name,
        station.capacity,
        station.consumption,
        station.consumptionTrend,
        station.costPerM3,
        station.savings,
        station.status === 'optimal' ? 'Optimal' :
            station.status === 'warning' ? 'Attention' : 'Optimisation requise',
        station.pumps,
        station.activePumps
    ]);

    return [headers, ...rows];
}

// Format efficiency ranking for Excel
function formatEfficiencySheet(ranking: EfficiencyData[]): any[][] {
    const headers = ['Station', 'Efficacité (%)', 'Coût/m³ (FCFA)'];
    const rows = ranking.map(item => [
        item.name,
        item.efficiency,
        item.cost
    ]);

    return [headers, ...rows];
}

// Format load distribution for Excel
function formatLoadDistributionSheet(distribution: LoadDistributionData[]): any[][] {
    const headers = ['Station', 'Part de production (%)'];
    const rows = distribution.map(item => [
        item.name,
        item.value
    ]);

    return [headers, ...rows];
}

// Format monthly trends for Excel
function formatMonthlyTrendsSheet(trends: MonthlyTrendData[]): any[][] {
    const headers = ['Jour', 'Ziga (FCFA/m³)', 'Paspanga (FCFA/m³)', 'Loumbila (FCFA/m³)', 'Tampouy (FCFA/m³)', 'Ouaga 2000 (FCFA/m³)'];
    const rows = trends.map(trend => [
        trend.day,
        parseFloat(trend.ziga.toFixed(2)),
        parseFloat(trend.paspanga.toFixed(2)),
        parseFloat(trend.loumbila.toFixed(2)),
        parseFloat(trend.tampouy.toFixed(2)),
        parseFloat(trend.ouaga2000.toFixed(2))
    ]);

    return [headers, ...rows];
}

// Generate Excel workbook
export function generateRegionalExcel(data: RegionalExportData): XLSX.WorkBook {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Stations Overview
    const stationsData = formatStationsSheet(data.stations);
    const ws1 = XLSX.utils.aoa_to_sheet(stationsData);

    // Set column widths for stations sheet
    ws1['!cols'] = [
        { wch: 15 },  // Station
        { wch: 12 },  // Capacité
        { wch: 18 },  // Consommation
        { wch: 12 },  // Tendance
        { wch: 15 },  // Coût/m³
        { wch: 20 },  // Économies
        { wch: 20 },  // État
        { wch: 15 },  // Pompes Totales
        { wch: 15 }   // Pompes Actives
    ];

    XLSX.utils.book_append_sheet(wb, ws1, 'Stations');

    // Sheet 2: Efficiency Ranking
    const efficiencyData = formatEfficiencySheet(data.efficiencyRanking);
    const ws2 = XLSX.utils.aoa_to_sheet(efficiencyData);
    ws2['!cols'] = [
        { wch: 15 },  // Station
        { wch: 15 },  // Efficacité
        { wch: 15 }   // Coût
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Efficacité');

    // Sheet 3: Load Distribution
    const loadData = formatLoadDistributionSheet(data.loadDistribution);
    const ws3 = XLSX.utils.aoa_to_sheet(loadData);
    ws3['!cols'] = [
        { wch: 15 },  // Station
        { wch: 20 }   // Part de production
    ];
    XLSX.utils.book_append_sheet(wb, ws3, 'Répartition Charge');

    // Sheet 4: Monthly Trends
    const trendsData = formatMonthlyTrendsSheet(data.monthlyTrend);
    const ws4 = XLSX.utils.aoa_to_sheet(trendsData);
    ws4['!cols'] = [
        { wch: 8 },   // Jour
        { wch: 15 },  // Ziga
        { wch: 18 },  // Paspanga
        { wch: 18 },  // Loumbila
        { wch: 15 },  // Tampouy
        { wch: 18 }   // Ouaga 2000
    ];
    XLSX.utils.book_append_sheet(wb, ws4, 'Tendances 30j');

    // Sheet 5: Summary
    const summaryData = [
        ['ONEA-OPT - Vue Régionale'],
        ['Zone Ouagadougou'],
        [''],
        ['Résumé'],
        ['Total Stations', data.totalStations],
        ['Stations Optimales', data.optimalStations],
        ['Taux Optimisation', `${Math.round((data.optimalStations / data.totalStations) * 100)}%`],
        ['Total Économies/jour', `${data.totalSavings.toLocaleString('fr-FR')} FCFA`],
        ['Total Économies/mois', `${(data.totalSavings * 30).toLocaleString('fr-FR')} FCFA`],
        ['Total Économies/an', `${(data.totalSavings * 365).toLocaleString('fr-FR')} FCFA`],
        [''],
        ['Date Export', new Date().toLocaleDateString('fr-FR')],
        ['Heure Export', new Date().toLocaleTimeString('fr-FR')]
    ];
    const ws5 = XLSX.utils.aoa_to_sheet(summaryData);
    ws5['!cols'] = [
        { wch: 25 },
        { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(wb, ws5, 'Résumé');

    return wb;
}

// Download Excel file
export function downloadExcel(wb: XLSX.WorkBook, filename: string): void {
    XLSX.writeFile(wb, filename);
}

// Main export function
export function exportRegionalData(data: RegionalExportData): void {
    const wb = generateRegionalExcel(data);
    const date = new Date().toISOString().split('T')[0];
    const filename = `ONEA-OPT-Regional-${date}.xlsx`;
    downloadExcel(wb, filename);
}
