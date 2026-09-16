export default function Card({ className = '', children, ...props }) {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}
