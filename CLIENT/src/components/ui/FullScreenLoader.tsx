// components/common/FullScreenLoader.tsx
const FullScreenLoader = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  };
  
  export default FullScreenLoader;
  