import { Buttons } from "./Buttons";
import { Titles } from "./Titles";

type SectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  button?: boolean;
  buttonText?: string;
  background?: string;
  gridMd?: string;
  gap?: string;
  onButtonClick?: () => void;
};

export default function Section({
  title,
  description,
  children,
  button,
  buttonText,
  background,
  gridMd,
  gap,
  onButtonClick,
}: SectionProps) {
  return (
    <div
      className={`${background === "purple" ? "bg-[var(--primary)] text-white" : "bg-white"} `}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <Titles background={background} className="text-center">
          {title}
        </Titles>
        <p
          className={`text-lg md:text-xl ${background === "purple" ? "text-white" : "text-gray-600"} text-center max-w-2xl mx-auto mt-8 mb-16`}
        >
          {description}
        </p>
        {/* <hr className="border-t-2 border-gray-200 my-12" /> */}
        <div
          className={`grid grid-cols-1 ${gridMd ? gridMd : "md:grid-cols-3"} gap-8 md:${gap ? gap : "gap-12"} my-16`}
        >
          {children}
        </div>
        <div className="text-center mt-20">
          {button ? (
            <div className="flex justify-center w-full">
              <Buttons onClick={onButtonClick}> {buttonText} </Buttons>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
