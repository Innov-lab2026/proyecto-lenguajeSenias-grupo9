import { APP_URL } from "../../constants/app";

export default function ButtonSuccess({ children, className, span = false, href }:
  { children: React.ReactNode, span?: boolean, className?: string, href?: string }) {
  return (
    <a
      href={href ?? APP_URL}
      className={`
        flex items-center gap-2
        px-3 md:px-5 py-2 md:py-2.5
        bg-success hover:bg-success-hover
        border-success-border
        rounded-full
        border
        text-sm md:text-base lg:text-2xl xl:text-3xl
        font-bold
        transition-colors
        drop-shadow-xl
        hover:cursor-pointer
        ${className ?? ""}
      `}
    >
      {children}
      {span && <span aria-hidden="true" className="text-xs md:text-base">⌵</span>}
    </a>
  );
}