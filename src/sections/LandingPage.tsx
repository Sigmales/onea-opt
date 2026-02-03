import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  Shield,
  Wifi,
  Droplets,
  Zap,
  Clock,
  TrendingDown,
  ChevronRight,
  Github,
  FileText,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/button';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface LandingPageProps {
  onStartDemo: () => void;
}

export function LandingPage({ onStartDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative min-h-screen gradient-hero overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div 
              className="flex items-center justify-center gap-3 mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Droplets className="w-10 h-10 text-[#0066CC]" />
              </div>
              <span className="text-4xl font-bold text-white">ONEA-OPT</span>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Réduisez vos charges<br />
              <span className="text-green-300">énergétiques de 15%</span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              grâce à l'Intelligence Artificielle
            </motion.p>

            <motion.p 
              className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Solution d'optimisation intelligente pour stations d'eau au Burkina Faso
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={onStartDemo}
                size="lg"
                className="h-14 px-8 bg-[#20AF24] hover:bg-[#1a8f1d] text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all animate-pulse-soft"
              >
                <Play className="w-5 h-5 mr-2" /> Essayer la démo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 text-lg font-semibold rounded-xl"
                onClick={() => {
                  window.location.href = '/documentation';
                }}
              >
                <FileText className="w-5 h-5 mr-2" /> Documentation
              </Button>
            </motion.div>

            {/* Abstract illustration */}
            <motion.div 
              className="mt-16 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <div className="relative">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Zap className="w-10 h-10 text-yellow-300" />
                  </div>
                  <div className="w-32 h-1 bg-white/30 rounded" />
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <div className="w-32 h-1 bg-white/30 rounded" />
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingDown className="w-10 h-10 text-green-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Le défi énergétique ONEA
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              L'énergie représente le principal poste de dépense des stations de pompage d'eau
            </p>
          </AnimatedSection>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-lg text-center card-hover"
            >
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-5xl font-bold text-[#1E293B] mb-2">90%+</p>
              <p className="text-gray-600">Dépendance électricité</p>
              <p className="text-sm text-gray-400 mt-2">du coût opérationnel</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-lg text-center card-hover"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-[#0066CC]" />
              </div>
              <p className="text-5xl font-bold text-[#1E293B] mb-2">22h/jour</p>
              <p className="text-gray-600">Pompage continu</p>
              <p className="text-sm text-gray-400 mt-2">pour répondre à la demande</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-lg text-center card-hover"
            >
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-10 h-10 text-[#FF6600]" />
              </div>
              <p className="text-5xl font-bold text-[#1E293B] mb-2">160 FCFA</p>
              <p className="text-gray-600">Coût SONABEL/kWh</p>
              <p className="text-sm text-gray-400 mt-2">tarif heures pleines</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Notre solution
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ONEA-OPT combine IA de pointe et expertise métier pour optimiser chaque aspect de la consommation énergétique
            </p>
          </AnimatedSection>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-[#0066CC] rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">Optimisation IA</h3>
              <p className="text-gray-600">
                Algorithme NSGA-II multi-objectifs pour un planning pompage adapté aux tarifs SONABEL et à la demande prévue
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-[#20AF24] rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">Surveillance 24/7</h3>
              <p className="text-gray-600">
                Isolation Forest détecte fuites et pannes en temps réel, avant impact significatif sur les coûts
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-[#FF6600] rounded-xl flex items-center justify-center mb-6">
                <Wifi className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">Résilient</h3>
              <p className="text-gray-600">
                Fonctionne sans internet grâce à l'Edge Computing. Parfait pour les zones à faible connectivité
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
              Résultats concrets - Station Ziga
            </h2>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <AnimatedSection>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#0066CC] rounded-xl flex items-center justify-center">
                    <Droplets className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1E293B]">Station Ziga</h3>
                    <p className="text-gray-500">Ouagadougou, Burkina Faso</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Coût quotidien avant</span>
                    <span className="text-2xl font-bold text-red-500">297,000 FCFA</span>
                  </div>
                  <div className="flex justify-center">
                    <ChevronRight className="w-8 h-8 text-[#20AF24] rotate-90" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-gray-600">Coût quotidien après</span>
                    <span className="text-2xl font-bold text-[#20AF24]">257,000 FCFA</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-3xl font-bold text-[#0066CC]">13.5%</p>
                    <p className="text-sm text-gray-600">Réduction</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-[#20AF24]">14.4M</p>
                    <p className="text-sm text-gray-600">FCFA/an</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-[#1E293B] mb-3">Capacité</h4>
                  <p className="text-gray-600">12,000 m³/h avec 3 pompes principales</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-[#1E293B] mb-3">Opération</h4>
                  <p className="text-gray-600">22h/jour de pompage continu</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-[#1E293B] mb-3">Optimisation</h4>
                  <p className="text-gray-600">30% du pompage déplacé aux heures creuses (22h-6h)</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-[#1E293B] mb-3">Impact CO₂</h4>
                  <p className="text-gray-600">142 kg CO₂ évités par mois</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-[#1E293B]">
        <div className="max-w-7xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-white mb-8">Technologies modernes et évolutives</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Recharts', 'shadcn/ui'].map((tech) => (
                <span 
                  key={tech}
                  className="px-6 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Prêt à optimiser votre station ?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Rejoignez les stations ONEA qui réduisent déjà leurs coûts énergétiques
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onStartDemo}
                size="lg"
                className="h-14 px-8 bg-[#20AF24] hover:bg-[#1a8f1d] text-white text-lg font-semibold rounded-xl shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" /> Démarrer la démo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 text-lg font-semibold rounded-xl"
              >
                <FileText className="w-5 h-5 mr-2" /> Télécharger documentation
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E293B] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0066CC] rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">ONEA-OPT</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a
                href="https://github.com/Sigmales/onea-opt"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
            <p>ONEA-OPT © 2026 - Hackathon ONEA</p>
            <p className="mt-1">Développé avec passion pour l'optimisation énergétique</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
