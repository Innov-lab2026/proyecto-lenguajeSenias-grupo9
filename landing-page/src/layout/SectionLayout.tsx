export default function SectionLayout({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
    return (
        <section
            id={id}
            className={`min-h-[calc(100vh-var(--header-height))]
                        scroll-mt-(--header-height)
                        ${className || ''}`}
        >
            {children}
        </section>
    );
};