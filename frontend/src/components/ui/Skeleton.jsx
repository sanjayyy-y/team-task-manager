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
        background: 'var(--skeleton-base)',
      }}
      animate={{
        backgroundColor: ['var(--skeleton-base)', 'var(--skeleton-highlight)', 'var(--skeleton-base)'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}
