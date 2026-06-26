// src/components/Card.jsx
import React from 'react';

export default function Card({ children, className = "", variant = "default" }) {
  // ✅ Different variants for different use cases
  const variants = {
    default: {
      width: "560px",
      height: "600px",
      padding: "40px 35px",
      borderRadius: "40px",
      background: "linear-gradient(145deg, #ffffff, #e8e8e8)",
      boxShadow: `
        20px 20px 40px rgba(29, 33, 50, 0.4),
        -15px -15px 30px rgba(255,255,255,0.95),
        inset 3px 3px 6px rgba(255,255,255,0.7),
        inset -4px -4px 8px rgba(0, 0, 0, 0.6)
      `,
    },
    register: {
      width: "520px",
      height: "auto",
      minHeight: "580px",
      padding: "35px 30px",
      borderRadius: "40px",
      background: "linear-gradient(145deg, #ffffff, #e8e8e8)",
      boxShadow: `
        20px 20px 40px rgba(29, 33, 50, 0.4),
        -15px -15px 30px rgba(255,255,255,0.95),
        inset 3px 3px 6px rgba(255,255,255,0.7),
        inset -4px -4px 8px rgba(0, 0, 0, 0.6)
      `,
    },
    rounded: {
      width: "560px",
      height: "auto",
      minHeight: "450px",
      padding: "40px 35px",
      borderRadius: "40px",
      background: "linear-gradient(145deg, #ffffff, #e8e8e8)",
      boxShadow: `
        20px 20px 40px rgba(29, 33, 50, 0.4),
        -15px -15px 30px rgba(255,255,255,0.95),
        inset 3px 3px 6px rgba(255,255,255,0.7),
        inset -4px -4px 8px rgba(0, 0, 0, 0.6)
      `,
    },
    small: {
      width: "380px",
      height: "auto",
      minHeight: "350px",
      padding: "30px 25px",
      borderRadius: "40px",
      background: "linear-gradient(145deg, #ffffff, #e8e8e8)",
      boxShadow: `
        15px 15px 30px rgba(29, 33, 50, 0.4),
        -10px -10px 20px rgba(255,255,255,0.95),
        inset 2px 2px 4px rgba(255,255,255,0.7),
        inset -3px -3px 6px rgba(0, 0, 0, 0.6)
      `,
    },
    minimal: {
      width: "480px",
      height: "auto",
      minHeight: "400px",
      padding: "35px 30px",
      borderRadius: "24px",
      background: "#ffffff",
      boxShadow: `
        0px 10px 40px rgba(0, 0, 0, 0.08),
        0px 2px 10px rgba(0, 0, 0, 0.06)
      `,
      border: "1px solid rgba(0,0,0,0.05)",
    },
  };

  const style = variants[variant] || variants.default;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${className}`}
      style={{
        width: style.width,
        height: style.height,
        maxWidth: "95vw",
        maxHeight: "95vh",
        padding: style.padding,
        borderRadius: style.borderRadius,
        background: style.background,
        boxShadow: style.boxShadow,
        border: style.border || "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ✅ Decorative glow effect */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-gradient-to-tl from-indigo-400/10 to-pink-400/10 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      
      {/* Content */}
      {children}
      
      {/* ✅ Decorative border glow */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none">
        <div className="absolute inset-[2px] rounded-[inherit] bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
      </div>
    </div>
  );
}