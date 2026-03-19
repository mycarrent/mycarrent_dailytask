/**
 * LoadingScreen — Full-screen loading state with brand logo
 * Theme: Orange & White
 */
import { motion } from "framer-motion";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452232695/Geqw5Dwwk2pA5LmRx3Tkji/my-car-rent-logo_efb7efea.webp";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center"
      >
        <img
          src={LOGO_URL}
          alt="My Car Rent"
          className="w-48 h-auto mx-auto mb-6"
        />
        <p className="text-sm text-gray-400 font-medium">กำลังโหลด...</p>
        <motion.div
          className="w-16 h-1.5 rounded-full mx-auto mt-4"
          style={{ backgroundColor: "#F97316" }}
          animate={{ scaleX: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
