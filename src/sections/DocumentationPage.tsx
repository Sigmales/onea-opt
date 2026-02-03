export function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <header className="bg-[#0066CC] text-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">Documentation ONEA-OPT</h1>
          <p className="text-sm text-blue-100 mt-1">
            Guide rapide d&apos;installation, d&apos;usage et de tests offline.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-2">Installation locale</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Installer Node.js 18+ et npm 9+.</li>
            <li>
              Cloner le dépôt GitHub&nbsp;:
              <code className="block bg-gray-100 rounded mt-1 px-2 py-1 text-xs text-gray-800">
                git clone https://github.com/Sigmales/onea-opt.git
              </code>
            </li>
            <li>
              Se placer dans le dossier&nbsp;:
              <code className="block bg-gray-100 rounded mt-1 px-2 py-1 text-xs text-gray-800">
                cd onea-opt
              </code>
            </li>
            <li>
              Installer les dépendances&nbsp;:
              <code className="block bg-gray-100 rounded mt-1 px-2 py-1 text-xs text-gray-800">
                npm install
              </code>
            </li>
            <li>
              Lancer en mode développement&nbsp;:
              <code className="block bg-gray-100 rounded mt-1 px-2 py-1 text-xs text-gray-800">
                npm run dev
              </code>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Build production</h2>
          <p className="text-sm text-gray-700 mb-2">
            Pour générer la version optimisée utilisée sur Vercel&nbsp;:
          </p>
          <code className="block bg-gray-100 rounded px-2 py-1 text-xs text-gray-800">
            npm run build
          </code>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Tests offline (PWA)</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Exécuter&nbsp;: <code className="bg-gray-100 rounded px-1">npm run build</code>.</li>
            <li>
              Servir le dossier <code className="bg-gray-100 rounded px-1">dist</code> avec un serveur statique, par exemple&nbsp;:
              <code className="block bg-gray-100 rounded mt-1 px-2 py-1 text-xs text-gray-800">
                npx serve dist -l 3000
              </code>
            </li>
            <li>Ouvrir Chrome sur <code className="bg-gray-100 rounded px-1">http://localhost:3000</code>.</li>
            <li>Ouvrir DevTools → onglet <strong>Application</strong> → vérifier que le Service Worker est &laquo;&nbsp;activated&nbsp;&raquo;.</li>
            <li>Dans l&apos;onglet <strong>Network</strong>, choisir le profil <strong>Offline</strong>, puis recharger la page.</li>
            <li>Vérifier que l&apos;application continue à fonctionner avec les données mises en cache.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Algorithmes IA & Optimisation</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#0066CC] mb-2">1. Prédiction Demande (LSTM Simplifié)</h3>
              <p className="text-sm text-gray-700 mb-2">
                Prédiction de la demande en eau 24h à l'avance pour la station Ziga.
              </p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                <li><strong>Missions TDR:</strong> 2, 11</li>
                <li><strong>Impact:</strong> Réduction 10-15% des coûts énergétiques</li>
                <li><strong>Tech:</strong> Analyse patterns temporels & facteurs saisonniers</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#0066CC] mb-2">2. Détection Anomalies (Isolation Forest)</h3>
              <p className="text-sm text-gray-700 mb-2">
                Monitoring non-supervisé des pompes pour détecter fuites et usures.
              </p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                <li><strong>Missions TDR:</strong> 7, 12</li>
                <li><strong>Alertes:</strong> Surconsommation, Fuites, Usure pompe</li>
                <li><strong>Features:</strong> kWh/m³, débit, niveau réservoir, vibration</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#0066CC] mb-2">3. Optimisation Planning (NSGA-II)</h3>
              <p className="text-sm text-gray-700 mb-2">
                Optimisation multi-objectifs du planning de pompage.
              </p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                <li><strong>Missions TDR:</strong> 2, 3, 4, 5, 6, 8</li>
                <li><strong>Gain:</strong> ~250 000 FCFA/jour (Station Ziga)</li>
                <li><strong>Objectifs:</strong> Coût énergie, contraintes réservoir, Cos φ</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Ressources supplémentaires</h2>
          <p className="text-sm text-gray-700 mb-3">
            La documentation détaillée (architecture, algorithmes IA, cas Station Ziga) est disponible sur le dépôt GitHub.
          </p>
          <a
            href="https://github.com/Sigmales/onea-opt"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#0066CC] text-white text-sm font-medium hover:bg-[#0050a1] transition-colors"
          >
            Ouvrir la documentation GitHub
          </a>
        </section>
      </main>
    </div>
  );
}

