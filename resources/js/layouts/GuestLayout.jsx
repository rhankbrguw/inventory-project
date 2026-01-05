import { motion } from 'framer-motion';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md md:max-w-lg"
            >
                {children}
            </motion.div>
        </div>
    );
}
