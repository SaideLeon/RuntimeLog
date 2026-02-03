import React from 'react';
import WindowFrame from './WindowFrame';
import { Terminal, Cpu, Globe, Coffee, MapPin, Briefcase, Clock, Heart } from 'lucide-react';

const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-2 text-gray-500 font-mono text-sm">
        <span>root</span>
        <span>/</span>
        <span className="text-emerald-600 dark:text-emerald-500">usr</span>
        <span>/</span>
        <span>bin</span>
        <span>/</span>
        <span>whoami</span>
      </div>

      <WindowFrame title="dados_perfil.json" className="shadow-2xl">
        <div className="p-8 md:p-12 bg-white dark:bg-[#0b0e11] transition-colors duration-300">
          
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Column: Avatar & Quick Stats */}
            <div className="md:w-1/3 flex flex-col items-center text-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 p-1 mb-6 shadow-xl relative group">
                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden relative">
                   {/* Placeholder Avatar */}
                   <Terminal size={64} className="text-gray-400 dark:text-gray-600 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-[#0b0e11] rounded-full shadow-lg" title="Status: Online"></div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Omar</h2>
              <p className="text-emerald-600 dark:text-emerald-500 font-mono text-sm mb-6">&lt;EngenheiroFullStack /&gt;</p>
              
              <div className="w-full space-y-3 font-mono text-xs">
                 <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800/30 rounded border border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 transition-colors">
                    <span className="text-gray-500 flex items-center gap-2"><MapPin size={12}/> Localização</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">São Paulo, BR</span>
                 </div>
                 <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800/30 rounded border border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 transition-colors">
                    <span className="text-gray-500 flex items-center gap-2"><Briefcase size={12}/> Experiência</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Nível Sênior</span>
                 </div>
                 <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800/30 rounded border border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 transition-colors">
                    <span className="text-gray-500 flex items-center gap-2"><Clock size={12}/> Tempo Online</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">99.9%</span>
                 </div>
              </div>
            </div>

            {/* Right Column: Bio & Content */}
            <div className="md:w-2/3">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                 <Terminal size={20} className="text-emerald-600 dark:text-emerald-500" />
                 <span>Missão</span>
               </h3>
               <div className="relative pl-6 border-l-2 border-emerald-500/30 mb-10">
                 <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light text-lg">
                   Acredito que o desenvolvimento de software é uma forma de arte funcional. Meu objetivo com o 
                   <span className="font-mono text-emerald-600 dark:text-emerald-500 font-medium mx-1">Code::Omar</span> 
                   é desmistificar conceitos complexos de arquitetura, DevOps e engenharia de software, transformando 
                   teoria acadêmica em prática de produção.
                 </p>
               </div>

               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                 <Cpu size={20} className="text-emerald-600 dark:text-emerald-500" />
                 <span>Stack Tecnológica</span>
               </h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 transition-colors group">
                     <h4 className="font-mono text-xs text-gray-500 mb-3 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Frontend Core</h4>
                     <div className="flex flex-wrap gap-2">
                        {['React 19', 'Next.js', 'Tailwind', 'TypeScript', 'Framer Motion'].map(t => (
                            <span key={t} className="px-2.5 py-1 text-xs rounded bg-white dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-mono border border-gray-200 dark:border-emerald-500/20">{t}</span>
                        ))}
                     </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/30 transition-colors group">
                     <h4 className="font-mono text-xs text-gray-500 mb-3 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Backend & Cloud</h4>
                     <div className="flex flex-wrap gap-2">
                        {['Node.js', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'K8s'].map(t => (
                            <span key={t} className="px-2.5 py-1 text-xs rounded bg-white dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-mono border border-gray-200 dark:border-emerald-500/20">{t}</span>
                        ))}
                     </div>
                  </div>
               </div>
               
               <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-6 text-sm text-gray-500 font-mono">
                  <a href="#" className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                     <Globe size={16} />
                     github.com/omar
                  </a>
                  <a href="#" className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                     <Coffee size={16} />
                     Pague-me um café
                  </a>
                  <span className="flex items-center gap-2 ml-auto text-gray-400">
                     <Heart size={14} className="text-red-500/80" />
                     Feito com lógica
                  </span>
               </div>
            </div>
          </div>

        </div>
      </WindowFrame>
    </div>
  );
};

export default AboutView;