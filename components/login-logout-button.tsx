"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signout } from "../lib/utils/auth.utils";
import { useState } from "react";
import { useAuthUser } from "./providers/auth-provider/auth-client-provider";
import { signInWithOAuth } from "../lib/utils/auth.utils";
import Loader from "./loader";

export function LoginLogoutButton(props: { className?: string }) {
  const { className = "" } = props;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const { user, refetch } = useAuthUser();

  return (
    <Button
      className={className}
      disabled={isLoading}
      type="button"
      variant="outline"
      onClick={async () => {
        setIsLoading(true);

        if (user) {
          const data = await signout();
          if (data === true) {
            router.push("/");
            await refetch();
            setIsLoading(false);
            return;
          }
        } else {
          await signInWithOAuth("google");
        }

        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }}
    >
      {isLoading ? <Loader /> : user ? "Logout" : "Login"}
    </Button>
  );
}

export default LoginLogoutButton;
