# ONEA-OPT 🚀

## Solution d'Optimisation Énergétique IA pour Stations d'Eau

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://web.dev/progressive-web-apps/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)

---

## 📋 Présentation

**ONEA-OPT** est une Progressive Web App (PWA) développée pour le Hackathon ONEA 2026 qui utilise l'Intelligence Artificielle pour réduire les charges énergétiques des stations de pompage d'eau potable au Burkina Faso.

### 🎯 Objectif
Réduire de **13.5%** les coûts énergétiques des stations ONEA grâce à :
- **NSGA-II** : Optimisation multi-objectifs du planning de pompage
- **Isolation Forest** : Détection automatique d'anomalies et fuites
- **LSTM Simplifié** : Prédiction de la demande en eau potable

### 💡 Impact
- **14.4M FCFA/an** d'économies sur la Station Ziga (cas pilote)
- **144M FCFA/an** potentiel si déploiement sur 10 stations
- **1,704 tonnes CO₂/an** évitées (équivalent 142 arbres)

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm 9+

### Installation

```bash
# Cloner le repository
git clone https://github.com/onea-opt/onea-opt.git
cd onea-opt

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Construire pour production
npm run build
```

### Accès Démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Technicien | demo.technicien@onea.bf | (aucun - mode démo) |
| Régional | demo.regional@onea.bf | (aucun - mode démo) |
| DG | demo.dg@onea.bf | (aucun - mode démo) |

---

## 📱 Installation PWA

### Android (Chrome)
1. Ouvrir le site sur Chrome
2. Menu (⋮) → "Ajouter à l'écran d'accueil"
3. Confirmer l'installation

### iOS (Safari)
1. Ouvrir le site sur Safari
2. Partager (⬆️) → "Sur l'écran d'accueil"
3. Confirmer l'installation

### Fonctionnalités PWA
- ✅ Fonctionnement **100% offline**
- ✅ Synchronisation automatique
- ✅ Notifications push
- ✅ Accès caméra terrain
- ✅ Export PDF rapports

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  STATION ZIGA (EDGE - AUTONOME OFFLINE)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Raspberry Pi 4 (35k FCFA)                           │   │
│  │ • Service Worker (cache stratégies)                 │   │
│  │ • IndexedDB (15 jours historique)                   │   │
│  │ • NSGA-II Optimizer (calcul local)                  │   │
│  │ • Isolation Forest Detector                         │   │
│  │ • Demand Predictor LSTM                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                    │ API REST (Modbus/CSV)                  │
│                    ▼                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Automate SCADA Existant                             │   │
│  │ • Pompe P1, P2, P3                                  │   │
│  │ • Export CSV horaire                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Synchronisation (1×/jour)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CLOUD VERCEL (REPORTING CENTRAL)                           │
│  • Dashboard DG : KPIs nationaux                            │
│  • Réentraînement modèles IA (mensuel)                     │
│  • Backup données historiques                               │
│  • Supabase PostgreSQL (gratuit tier)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 Algorithmes IA

### NSGA-II (Optimisation Planning)
```typescript
// Exemple d'utilisation
import { optimizePumpSchedule } from './lib/algorithms/nsga2';

const result = optimizePumpSchedule({
  demand: [/* 24h demand */],
  tariffs: [/* 24h tariffs */],
  reservoirLevel: 78,
  pumps: [{ id: 'P1', power: 450, efficiency: 1.75, maxFlow: 4000 }],
  constraints: { minReservoir: 60, maxReservoir: 90, minCosPhi: 0.93, maxActivePumps: 3 }
});

// Résultat : { planning, cost, savings, cosPhi, paretoFront }
```

### Isolation Forest (Détection Anomalies)
```typescript
import { detectAnomalies } from './lib/algorithms/isolation-forest';

const anomalies = detectAnomalies(pumpDataPoints);
// Résultat : [{ score, isAnomaly, probableCause, confidence }]
```

### LSTM Simplifié (Prédiction Demande)
```typescript
import { predictDemand } from './lib/algorithms/demand-predictor';

const prediction = predictDemand({
  historical: [/* 7 jours */],
  dayOfWeek: 2,
  isHoliday: false,
  temperature: 38,
  season: 'dry'
});

// Résultat : { hourly: [/* 24h */], confidence, peakHours }
```

---

## 📁 Structure du Projet

```
onea-opt/
├── public/                 # Assets statiques
│   ├── sw.js              # Service Worker
│   ├── manifest.json      # PWA Manifest
│   └── offline.html       # Page offline
├── src/
│   ├── sections/          # Composants pages
│   │   ├── AuthPage.tsx
│   │   ├── TechnicienDashboard.tsx
│   │   ├── OptimisationModule.tsx
│   │   ├── AnomaliesModule.tsx
│   │   ├── RegionalDashboard.tsx
│   │   ├── DGDashboard.tsx
│   │   └── LandingPage.tsx
│   ├── lib/
│   │   ├── algorithms/    # Algorithmes IA
│   │   │   ├── nsga2.ts
│   │   │   ├── isolation-forest.ts
│   │   │   └── demand-predictor.ts
│   │   ├── data/          # Données mock
│   │   │   └── ziga-mock-data.ts
│   │   ├── db.ts          # IndexedDB
│   │   ├── notifications.ts
│   │   ├── camera.ts
│   │   └── pdf-export.ts
│   ├── store/
│   │   └── useAppStore.ts # Zustand store
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── algorithmes/           # Export JSON algorithmes
│   ├── nsga2.json
│   ├── isolation-forest.json
│   └── demand-predictor.json
├── documentation/         # Documentation PDF
├── CONFORMITE_TDR.md      # Checklist missions TDR
├── TESTS_OFFLINE.md       # Tests PWA offline
├── CONDITIONS_EXPLOITATION.txt
└── README.md
```

---

## 🎨 Design System

### Couleurs
```css
--onea-primary: #0066CC;      /* Bleu eau ONEA */
--onea-secondary: #20AF24;    /* Vert économies */
--onea-accent: #FF6600;       /* Orange alertes */
--onea-neutral: #F8FAFC;      /* Fond clair */
--onea-text: #1E293B;         /* Ardoise foncé */
--onea-danger: #EF4444;       /* Rouge erreur */
--onea-warning: #F59E0B;      /* Jaune avertissement */
```

### Typographie
- **Police** : Inter (Google Fonts)
- **Tailles** : 12px (labels), 14px (body), 16px (titres), 24px (hero)

### Responsive
- **Mobile** : 320px+ (iPhone SE)
- **Tablet** : 768px+
- **Desktop** : 1024px+
- **Touch targets** : 48px minimum

---

## 🧪 Tests

### Tests Offline
```bash
# Lancer serveur local
cd dist
npx serve -s -l 3000

# Ouvrir Chrome DevTools
# Network → Throttling → Offline
# Rafraîchir et vérifier fonctionnement
```

### Lighthouse
```bash
npm run build
npx serve dist
# Ouvrir Chrome DevTools → Lighthouse → PWA
```

---

## 📦 Livrables Hackathon

### Fichiers ZIP
- `ONEA_OPT_Hackathon2026.zip` (à créer)

### Contenu
```
ONEA_OPT_Hackathon2026/
├── documentation/
│   ├── Note_explicative_ONEA_OPT.pdf
│   ├── Recommandations_mise_echelle_ONEA.pdf
│   └── Etude_cas_Station_Ziga.pdf
├── algorithmes/
│   ├── nsga2.json
│   ├── isolation-forest.json
│   └── demand-predictor.json
├── architecture/
│   └── schema_edge_computing.png
├── captures_ecran/
│   ├── dashboard-technicien.png
│   ├── module-optimisation.png
│   ├── detection-anomalies.png
│   ├── dashboard-regional.png
│   └── dashboard-dg.png
├── code_source/
│   └── (ce repository)
├── CONDITIONS_EXPLOITATION.txt
└── README.txt
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir `CONTRIBUTING.md` pour les guidelines.

---

## 📄 Licence

Ce projet est sous licence MIT. Voir [CONDITIONS_EXPLOITATION.txt](CONDITIONS_EXPLOITATION.txt) pour les droits spécifiques de l'ONEA.

---

## 📞 Contact

**ONEA Burkina Faso**
- Direction Générale
- Ouagadougou, Burkina Faso
- Email : dg@onea.bf

**ONEA-OPT Team**
- Email : onea-opt@hackathon2026.onea.bf

---

## 🙏 Remerciements

- Direction Générale de l'ONEA pour le challenge
- Équipe technique ONEA pour les données Station Ziga
- Communauté open-source pour les outils (React, Zustand, Recharts)

---

<p align="center">
  <strong>ONEA-OPT - Optimiser l'énergie, préserver l'eau 💧⚡</strong>
</p>

---

*Version 2.0.0 - 3 février 2026*
*Hackathon ONEA 2026*
