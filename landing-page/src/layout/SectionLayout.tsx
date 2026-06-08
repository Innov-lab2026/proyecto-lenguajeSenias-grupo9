export default function SectionLayout({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
    return (
        <section
            id={id}
            className={`min-h-[calc(100vh-5rem)]
                        scroll-mt-20
                        ${className || ''}`}
        >
            {children}
        </section>
    );
};