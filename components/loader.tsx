"use client";

import { Loader2 } from "lucide-react";

const Loader = (props: { size?: number; className?: string }) => {
  const { size = 16, className = "" } = props;
  return <Loader2 className={`animate-spin ${className}`} size={size} />;
};

export default Loader;
