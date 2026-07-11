// ============================================================
// BUTTON COMPONENT
// A reusable button with different styles and sizes
// ============================================================

export default function Button({ 
  children,      // Text or elements inside the button
  variant = 'primary', // Style: primary, secondary, success, danger, warning, outline
  size = 'md',   // Size: sm, md, lg
  className = '', // Extra CSS classes
  loading = false, // Shows spinner when true
  fullWidth = false, // Makes button full width
  ...props       // All other button attributes (onClick, type, etc.)
}) {
  
  // ============================================================
  // BUTTON STYLES (6 Different Colors)
  // ============================================================
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white',
  };

  // ============================================================
  // BUTTON SIZES (3 Different Sizes)
  // ============================================================
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',      // Small
    md: 'px-4 py-2 text-sm',        // Medium (default)
    lg: 'px-6 py-3 text-base',      // Large
  };

  // ============================================================
  // RENDER BUTTON
  // ============================================================
  return (
    <button
      className={`
        inline-flex items-center justify-center 
        font-medium rounded-xl 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {/* If loading, show spinner, else show children */}
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}