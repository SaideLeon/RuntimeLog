import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, ChevronRight } from 'lucide-react';
import WindowFrame from './WindowFrame';

interface HeroProps {
  onSubscribe: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSubscribe }) => {
  return (
    <section className="relative z-10 pt-20 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Text Content */}
        <div className="space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono mb-4">
              v2.0.4 :: LANÇADO
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 font-sans transition-colors duration-300">
              Code<span className="text-emerald-600 dark:text-emerald-500">::Omar</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg mx-auto lg:mx-0 font-light transition-colors duration-300">
              Descodificando a complexidade do software. Um blog para engenheiros que preferem código a reuniões.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <button className="px-6 py-3 bg-emerald-500 text-white dark:text-black font-bold rounded hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg dark:shadow-none">
              <Terminal size={18} />
              Ler Recentes
            </button>
            <button 
              onClick={onSubscribe}
              className="px-6 py-3 border border-emerald-500/50 text-emerald-600 dark:text-emerald-500 rounded hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2"
            >
              <Code size={18} />
              Assinar
            </button>
          </motion.div>
        </div>

        {/* Right: Visual Animation (Stacking Windows) */}
        <div className="relative h-[400px] w-full hidden md:block perspective-1000">
          {/* Back Window */}
          <motion.div
             className="absolute top-0 right-0 w-3/4 h-64 z-10"
             initial={{ x: 100, y: -50, opacity: 0 }}
             animate={{ x: 40, y: -40, opacity: 0.4 }}
             transition={{ duration: 1, delay: 0.1 }}
          >
            <WindowFrame title="servico_backend.go" className="h-full w-full opacity-50">
                <div className="space-y-2 font-mono text-xs text-emerald-700 dark:text-emerald-700">
                  <div className="h-2 w-1/3 bg-emerald-900/10 dark:bg-emerald-900/30 rounded"></div>
                  <div className="h-2 w-2/3 bg-emerald-900/10 dark:bg-emerald-900/30 rounded"></div>
                  <div className="h-2 w-1/2 bg-emerald-900/10 dark:bg-emerald-900/30 rounded"></div>
                </div>
            </WindowFrame>
          </motion.div>

          {/* Middle Window */}
          <motion.div
             className="absolute top-12 right-12 w-3/4 h-64 z-20"
             initial={{ x: 100, y: -20, opacity: 0 }}
             animate={{ x: 20, y: -20, opacity: 0.7 }}
             transition={{ duration: 1, delay: 0.3 }}
          >
            <WindowFrame title="schema.graphql" className="h-full w-full">
                <div className="space-y-2 font-mono text-xs text-emerald-700 dark:text-emerald-600">
                  <div className="flex gap-2"><span className="text-pink-600 dark:text-pink-500">type</span> Usuario <span className="text-yellow-600 dark:text-yellow-500">{`{`}</span></div>
                  <div className="pl-4 text-emerald-600 dark:text-emerald-500">id: ID!</div>
                  <div className="pl-4 text-emerald-600 dark:text-emerald-500">nome: String!</div>
                  <div className="text-yellow-600 dark:text-yellow-500">{`}`}</div>
                </div>
            </WindowFrame>
          </motion.div>

          {/* Front Window */}
          <motion.div
             className="absolute top-24 right-24 w-3/4 h-72 z-30"
             initial={{ x: 100, y: 50, opacity: 0 }}
             animate={{ x: 0, y: 0, opacity: 1 }}
             transition={{ duration: 1, delay: 0.5 }}
          >
             <WindowFrame title="App.tsx" className="h-full w-full shadow-2xl dark:shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <div className="space-y-2 font-mono text-sm">
                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                     <span className="text-purple-600 dark:text-purple-400">import</span> React <span className="text-purple-600 dark:text-purple-400">from</span> 'react';
                   </div>
                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                     <span className="text-blue-600 dark:text-blue-400">const</span> Blog <span className="text-blue-600 dark:text-blue-400">=</span> () <span className="text-blue-600 dark:text-blue-400">=&gt;</span> <span className="text-yellow-600 dark:text-yellow-400">{`{`}</span>
                   </div>
                   <div className="pl-4 text-gray-500 dark:text-gray-400">
                     <span className="text-purple-600 dark:text-purple-400">return</span> (
                   </div>
                   <div className="pl-8 text-emerald-600 dark:text-emerald-400">
                     &lt;CodeOmar /&gt;
                   </div>
                   <div className="pl-4 text-gray-500 dark:text-gray-400">);</div>
                   <div className="text-yellow-600 dark:text-yellow-400">{`}`}</div>
                   
                   <div className="mt-8 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded border border-emerald-500/20 flex items-center gap-3">
                     <div className="p-1 bg-emerald-500 rounded text-white dark:text-black"><Cpu size={16} /></div>
                     <span className="text-emerald-700 dark:text-emerald-300 text-xs">Compilando... 400ms</span>
                   </div>
                </div>
             </WindowFrame>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;