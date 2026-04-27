import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'premium';
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Button({ variant = 'primary', href, children, className = '', ...props }: ButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center font-modern font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 overflow-hidden outline-none";
  
  let variantClasses = "";
  
  switch (variant) {
    case 'primary':
      variantClasses = "bg-accent text-white shadow-soft hover:shadow-card";
      break;
    case 'secondary':
      variantClasses = "bg-white text-primary border-2 border-primary shadow-soft hover:shadow-card hover:bg-primary hover:text-white";
      break;
    case 'premium':
      variantClasses = "text-white shadow-lg bg-gradient-to-r from-accent via-luxury to-accent bg-[length:200%_200%] animate-gradient-x border border-luxury/30";
      break;
  }

  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {/* Shine effect overlay for hover */}
      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition duration-300 z-0"></span>
    </>
  );

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block"
      >
        <Link to={href} className={combinedClasses}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={combinedClasses}
      {...props}
    >
      {content}
    </motion.button>
  );
}
