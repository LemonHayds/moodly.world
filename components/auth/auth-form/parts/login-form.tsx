import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconMailFilled } from "@tabler/icons-react";
import Loader from "../../../loader";
import { useState } from "react";

import { login } from "../../../../lib/utils/auth.utils";
import AuthButton from "../../auth-button";
import { authOptions } from "../auth-form";
import { AuthErrorType } from "../auth-form";
import { AuthFormChildProps } from "./sign-up-form";

export function LoginForm(props: AuthFormChildProps) {
  const {
    setAuthModalOpen,
    showTitle = false,
    setIsSignIn,
    authError,
    setAuthError,
    authButtonsDisabled = false,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const handleSignIn = async (form: FormData) => {
    setIsLoading(true);

    const data = await login(form);

    setTimeout(() => {
      if (data === true) {
        setAuthModalOpen(false);
      } else {
        setAuthError(data as AuthErrorType);
      }

      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="select-none">
      {showTitle && <CardTitle className="text-2xl">Login</CardTitle>}
      <CardDescription className="mb-5">
        Enter your email and password below to login to your account.
      </CardDescription>
      <form action="" className="grid gap-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {!isLoading && authError?.message && (
          <span className="flex justify-center text-sm text-red-500/80">
            {authError.message}
          </span>
        )}

        <div className="mt-1 grid gap-2">
          <Button
            disabled={authButtonsDisabled}
            type="submit"
            formAction={handleSignIn}
            className="w-full"
          >
            {isLoading ? (
              <Loader className="inline animate-spin" />
            ) : (
              <span className="flex gap-2 items-center">
                Sign in
                <IconMailFilled size={19} />
              </span>
            )}
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            {authOptions.map((type) => (
              <AuthButton
                disabled={authButtonsDisabled}
                key={type}
                type={type}
              />
            ))}
          </div>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <span
          onClick={() => {
            if (setIsSignIn && !authButtonsDisabled) {
              setIsSignIn(false);
            }
          }}
          className="underline hover:cursor-pointer hover:opacity-80"
        >
          Sign up
        </span>
      </div>
    </div>
  );
}
