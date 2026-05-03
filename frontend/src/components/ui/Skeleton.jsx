import { motion } from 'framer-motion';

export default function Skeleton({ className = '', style = {}, height, width, borderRadius = '6px' }) {
  return (
    <motion.div
      className={`skeleton ${className}`}
      style={{
        ...style,
        height: height || style.height,
        width: width || style.width,
        borderRadius,
        background: '#1e1e1e', // Base color
      }}
      animate={{
        backgroundColor: ['#1e1e1e', '#2a2a3a', '#1e1e1e'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}
