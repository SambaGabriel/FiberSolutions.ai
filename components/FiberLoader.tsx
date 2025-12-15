import React from 'react';

interface FiberLoaderProps {
    size?: number;
    progress?: number; // 0 a 100. Se undefined, roda infinito.
    text?: string;
    showText?: boolean;
}

const FiberLoader: React.FC<FiberLoaderProps> = ({ size = 60, progress, text, showText = true }) => {
    const isIndeterminate = progress === undefined;
    const currentProgress = isIndeterminate ? 25 : progress; // Tamanho fixo para modo infinito
    
    // Configurações do SVG
    const center = 50;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((currentProgress / 100) * circumference);
    
    // Rotação para o "Lasher" (Cabeça da máquina)
    const rotation = isIndeterminate 
        ? 0 // A animação CSS cuida da rotação no modo indeterminado
        : (currentProgress / 100) * 360;

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div 
                className={`relative flex items-center justify-center ${isIndeterminate ? 'animate-spin' : ''}`} 
                style={{ width: size, height: size, animationDuration: '2s' }}
            >
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* 1. STRAND (Cordoalha - Fundo) */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="#334155" // Slate 700 (Cor de aço escuro)
                        strokeWidth="8"
                    />
                    
                    {/* Detalhe do Strand (Textura de cabo de aço torcido) */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth="2"
                        strokeDasharray="2 4"
                        className="opacity-50"
                    />

                    {/* 2. FIBRA (Progresso - Laranja) */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="#FF5500" // FS Brand Color
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-linear"
                    />

                    {/* 3. LASHING WIRE (Arame de Espinar - Tracejado fino girando) */}
                    {/* Simula o arame enrolado na fibra já passada */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeDasharray="1 6"
                        strokeDashoffset={strokeDashoffset}
                        className={`${isIndeterminate ? '' : 'animate-[spin_4s_linear_infinite]'} opacity-80`}
                        style={{ transformOrigin: 'center' }}
                    />
                </svg>

                {/* 4. THE LASHER (Máquina de Espinar) */}
                {/* Um elemento HTML absoluto posicionado em cima do SVG para simular a máquina */}
                <div 
                    className="absolute inset-0"
                    style={{ 
                        transform: `rotate(${rotation}deg)`,
                        transition: isIndeterminate ? 'none' : 'transform 0.3s linear'
                    }}
                >
                    <div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px]"
                        style={{ width: size * 0.25, height: size * 0.25 }}
                    >
                        {/* Corpo da Máquina (Lasher) */}
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-400 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white flex items-center justify-center relative">
                            {/* Rolo de arame interno */}
                            <div className="w-1/2 h-1/2 rounded-full border-2 border-slate-500 border-dashed animate-[spin_1s_linear_infinite]"></div>
                            
                            {/* Faíscas/Brilho da operação */}
                            <div className="absolute -bottom-1 w-full h-1 bg-fs-brand blur-[2px] opacity-80 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {showText && (
                <div className="text-center">
                    <p className="text-fs-brand font-bold uppercase tracking-widest text-xs animate-pulse">
                        {text || (isIndeterminate ? 'Lashing Fiber...' : `${Math.round(progress || 0)}% Concluído`)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FiberLoader;