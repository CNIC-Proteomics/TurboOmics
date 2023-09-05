import React from 'react'
import { motion } from "framer-motion"

export default function MyMotion({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: "easeOut", duration: 0.5 }}
        >
            {children}
        </motion.div>
    )
}