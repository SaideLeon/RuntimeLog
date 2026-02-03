import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import { Mail, Terminal, CheckCircle, ArrowRight, Loader, Code2 } from 'lucide-react';

const SubscribeView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!email) return;
    setStatus('LOADING');
    // Simulate API call
    setTimeout(() => {
      setStatus('SUCCESS');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-2 text-gray-500 font-mono text-sm">
            <span>root</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-500">etc</span>
            <span>/</span>
            <span>config_newsletter</span>
        </div>

        <WindowFrame title="inscricao.sh" className="min-h-[500px] flex flex-col md:flex-row shadow-2xl">
            {/* Left Panel: Pitch */}
            <div className="md:w-5/12 p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0c0c0c] relative overflow-hidden transition-colors duration-300">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-5 text-black dark:text-white">
                    <Code2 size={120} />
                </div>

                <div className="relative z-10">
                    <div className="inline-block px-3 py-1 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">#!/bin/bash</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">
                        Inicializar<br/>
                        <span className="text-emerald-600 dark:text-emerald-500">Stream</span> de<br/>
                        Conhecimento
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 font-light transition-colors duration-300">
                        Junte-se a mais de 10.000 engenheiros recebendo análises profundas de arquitetura, dicas de otimização e algoritmos de carreira.
                    </p>
                    
                    <div className="space-y-4">
                        {[
                            'Desafios semanais de System Design',
                            'Dicas de performance React & Backend',
                            'Soft-skills para engenharia sênior',
                            'Zero spam, apenas código puro'
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 font-mono group">
                                <span className="text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform">
                                    <CheckCircle size={16} />
                                </span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-[#0b0e11] transition-colors duration-300">
                {status === 'SUCCESS' ? (
                     <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300 py-8">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <CheckCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inscrição Ativa</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">Target: <span className="text-emerald-600 dark:text-emerald-400">{email}</span></p>
                        </div>
                        
                        <div className="max-w-sm mx-auto p-4 bg-gray-50 dark:bg-black/40 rounded-lg border border-gray-200 dark:border-emerald-500/20 font-mono text-xs text-left text-emerald-700 dark:text-emerald-500/70 mt-4 shadow-inner">
                            <p className="mb-1"><span className="text-gray-500 dark:text-gray-600">admin@runtime:~$</span> ./verificar_email.sh</p>
                            <p className="text-gray-500 dark:text-gray-400">> estabelecendo conexão... OK</p>
                            <p className="text-gray-500 dark:text-gray-400">> registrando webhook... OK</p>
                            <p className="text-emerald-600 dark:text-emerald-400">> enviando pacote_boas_vindas.json... ENVIADO</p>
                        </div>
                     </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 max-w-sm mx-auto w-full">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">
                                    // Digite seu email
                                </label>
                                <div className="text-sm font-mono text-emerald-600 dark:text-emerald-500 mb-1">
                                    const subscriber = <span className="text-yellow-600 dark:text-yellow-500">{'{'}</span>
                                </div>
                                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 transition-colors">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-600 flex items-center gap-2 font-mono text-sm pointer-events-none">
                                            email: 
                                        </div>
                                        <input 
                                            type="email" 
                                            required
                                            className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 pl-20 pr-4 text-emerald-900 dark:text-emerald-100 font-mono placeholder-gray-400 dark:placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-[#1a1f24] transition-all shadow-sm dark:shadow-none"
                                            placeholder="'dev@runtime.log'"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={status === 'LOADING'}
                                        />
                                    </div>
                                </div>
                                <div className="text-sm font-mono text-yellow-600 dark:text-yellow-500 mt-1">
                                    {'}'}
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={status === 'LOADING'}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white dark:text-black font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] dark:shadow-[0_0_20px_rgba(5,150,105,0.3)] dark:hover:shadow-[0_0_30px_rgba(5,150,105,0.5)]"
                        >
                            {status === 'LOADING' ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    <span>Processando...</span>
                                </>
                            ) : (
                                <>
                                    <Terminal size={18} />
                                    <span>Executar Inscrição</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        
                        <p className="text-[10px] text-gray-500 dark:text-gray-600 text-center font-mono uppercase tracking-widest">
                            Conexão Segura • Criptografia TLS
                        </p>
                    </form>
                )}
            </div>
        </WindowFrame>
    </div>
  );
};

export default SubscribeView;