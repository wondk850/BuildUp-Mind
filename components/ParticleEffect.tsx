import React from 'react';

const Particle: React.FC = () => {
    const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 90%, 60%)`,
    };
    return <div className="absolute top-0 w-2 h-2 rounded-full animate-confetti" style={style} />;
};

export const ParticleEffect: React.FC = () => {
    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {Array.from({ length: 50 }).map((_, i) => <Particle key={i} />)}
            </div>
            <style>{`
                @keyframes confetti {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-confetti {
                    animation: confetti linear forwards;
                }
            `}</style>
        </>
    );
};
