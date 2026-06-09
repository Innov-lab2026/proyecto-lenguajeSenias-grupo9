export default function ButtonSuccess({ children, className, span = false }:
  { children: React.ReactNode, span?: boolean, className?: string }) {
  return (
    <button
      className={`
        flex items-center gap-2
        px-5 py-2.5
        bg-success hover:bg-success-hover
        border-success-border
        rounded-full
        border
        text-[26px]
        font-bold
        transition-colors
        drop-shadow-xl
        hover:cursor-pointer
        ${className ?? ""}
      `}
    >
      {children}
      {span && <span aria-hidden="true" className="text-[16px]">⌵</span>}
    </button>
  );
}
