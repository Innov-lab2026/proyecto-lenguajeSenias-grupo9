export default function ButtonDownload() {
  return (
    <button
      className="
        flex items-center gap-2
        px-5 py-2.5
        rounded-xl
        border
        text-base
        font-medium
        transition-colors
        hover:cursor-pointer
      "
    >
      Descargar
      <span aria-hidden="true">⌵</span>
    </button>
  );
}
