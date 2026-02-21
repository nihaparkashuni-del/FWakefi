import React from 'react';
import { motion } from 'framer-motion';

const PremiumButton = ({ children, onClick, className = '', variant = 'primary', disabled = false, loading = false, ...props }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-accent to-orange-400 text-slate-950 font-bold shadow-lg shadow-accent/20',
        secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
        ghost: 'bg-transparent text-slate-400 hover:text-white',
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, translateY: -1 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
            {...props}
        >
            {loading && <span className="spinner">⏳</span>}
            {children}
        </motion.button>
    );
};

export default PremiumButton;
