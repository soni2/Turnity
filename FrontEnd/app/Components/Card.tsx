
type CardProps = {
    title: string;
    description: string;
    children: React.ReactNode;
    background?: string;
    className?: string;
}

export default function Card({title, description, children, background, className}: CardProps) {
    return (
            <div className={`text-left ${className}`}> 
                {children}
              <h2 className={`text-xl md:text-2xl font-semibold mb-4 text-center ${(background==="purple")?"text-white]":"text-black"}`}>{title}</h2>
              <p className={`text-center ${(background==="purple")?"text-white]":"text-gray-600"}`}>{description}</p>
            </div>
        )
}