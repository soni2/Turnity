{/* Título principal */}
export const Titles = ({ children, background, className }: { children: React.ReactNode, background?: string, className?: string }) => {
    return (
        <div className="space-y-2 flex flex-col w-full justify-center">
            <h1 className={`${className} text-5xl font-black uppercase ${(!background ? "bg-gradient-to-b from-[var(--primary)] from-40% to-black":"bg-white")} bg-clip-text text-transparent leading-none`}>
            {children}
            </h1>
        </div>
    )
}