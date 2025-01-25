import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ModalProps = {
  triggerNode?: React.ReactNode;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  contents?: string | React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  className?: string;
};

export default function Modal(props: ModalProps) {
  const {
    isOpen,
    triggerNode,
    title,
    description,
    contents,
    setIsOpen,
    className = "",
  } = props;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      <DialogContent className={`sm:max-w-md ${className}`}>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {contents}
      </DialogContent>
    </Dialog>
  );
}
