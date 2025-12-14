// FILE: src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ fullScreen = false, size = "md" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-4 border-amber-200 border-t-amber-500 
                    rounded-full animate-spin`}
      />
      <span className="text-amber-600 font-medium animate-pulse">
        Loading delicious sweets...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-12">{spinner}</div>;
}