import { signup } from "../../../../lib/utils/auth.utils";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "../../../loader";

import { authOptions } from "../auth-form";
import AuthButton from "../../auth-button";
import { AuthFormProps, AuthErrorType } from "../auth-form";
import { IconMailFilled } from "@tabler/icons-react";
import { useState } from "react";

export type AuthFormChildProps = AuthFormProps & {
  authError?: AuthErrorType;
  setAuthError: (error: AuthErrorType) => void;
  authButtonsDisabled?: boolean;
};

export function SignUpForm(props: AuthFormChildProps) {
  const {
    authError,
    showTitle = false,
    setAuthModalOpen,
    setAuthError,
    setIsSignIn,
    authButtonsDisabled = false,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (form: FormData) => {
    setIsLoading(true);

    const data = await signup(form);

    setTimeout(() => {
      if (data === true) {
        // refetch();
        setAuthModalOpen(false);
      } else {
        setAuthError(data as AuthErrorType);
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="select-none">
      {showTitle && <CardTitle className="text-xl">Sign Up</CardTitle>}
      <CardDescription className="mb-5">
        Enter your details below to create an account.
      </CardDescription>
      <form action="">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                name="first-name"
                id="first-name"
                placeholder="Optional"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                name="last-name"
                id="last-name"
                placeholder="Optional"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="lemon@email.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input name="password" id="password" type="password" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              required
              name="confirm-password"
              id="confirm-password"
              type="password"
            />
          </div>

          {!isLoading && authError?.message && (
            <span className="flex justify-center text-sm text-red-500/80">
              {authError.message}
            </span>
          )}

          <div className="flex flex-col gap-y-2">
            <Button
              formAction={handleSignUp}
              type="submit"
              disabled={authButtonsDisabled}
              className="w-full"
            >
              {isLoading ? (
                <Loader className="inline" />
              ) : (
                <span className="flex gap-2 items-center">
                  Create an account
                  <IconMailFilled size={19} />
                </span>
              )}
            </Button>

            <div className="flex items-center gap-2 flex-wrap">
              {authOptions.map((type) => (
                <AuthButton
                  key={type}
                  type={type}
                  disabled={authButtonsDisabled}
                />
              ))}
            </div>
          </div>
        </div>
      </form>

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <span
          onClick={() => {
            if (setIsSignIn && !authButtonsDisabled) {
              setIsSignIn(true);
            }
          }}
          className="underline hover:cursor-pointer hover:opacity-80"
        >
          Sign in
        </span>
      </div>
    </div>
  );
}
