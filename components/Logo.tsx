import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", showText = false }) => {
    return (
        <div className="flex items-center gap-3 select-none">
            {/* Icon Container */}
            <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
                 <svg 
                    viewBox="0 0 100 100" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-full h-full"
                >
                    {/* Smooth Dome (Sem crista/alça) */}
                    <path 
                        d="M20 64 C 20 38 32 18 50 18 C 68 18 80 38 80 64 H 20 Z" 
                        fill="white"
                    />
                    
                    {/* Visor/Brim (Base sólida) */}
                    <path 
                        d="M10 64 H 90 V 70 C 90 73 87 75 84 75 H 16 C 13 75 10 73 10 70 V 64 Z" 
                        fill="white"
                    />
                </svg>
            </div>
            
            {/* Text Container */}
            {showText && (
                <div className="flex flex-col justify-center whitespace-nowrap">
                    <h1 className="text-xl font-black text-white tracking-tighter leading-none" style={{fontFamily: '"Plus Jakarta Sans", sans-serif'}}>
                        FIBER<span className="text-fs-brand">SOLUTIONS.ai</span>
                    </h1>
                </div>
            )}
        </div>
    );
};

export default Logo;