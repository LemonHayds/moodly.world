import { Pacifico } from "next/font/google";

type MoodlyTextProps = {
  children: React.ReactNode;
  className?: string;
};

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
});

const MoodlyText = ({ children, className = "" }: MoodlyTextProps) => {
  return <div className={`${className} ${pacifico.className}`}>{children}</div>;
};

export default MoodlyText;
