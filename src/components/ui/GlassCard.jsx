import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { scale: 1.01, translateY: -2 } : {}}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`glass rounded-2xl p-6 transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
