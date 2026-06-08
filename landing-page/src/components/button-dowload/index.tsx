export default function ButtonDownload() {
  return (
    <button
      className="
        flex items-center gap-2
        px-5 py-2.5
        bg-success hover:bg-success-hover
        border-success-border
        rounded-full
        border
        text-[26px]
        font-bold
        text-foreground
        transition-colors
        hover:cursor-pointer
      "
    >
      Descargar
      <span aria-hidden="true" className="text-[16px]">⌵</span>
    </button>
  );
}
