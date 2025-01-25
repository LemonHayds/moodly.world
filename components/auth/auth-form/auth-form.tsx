import { useEffect, useState } from "react";

import { LoginForm } from "./parts/login-form";
import { SignUpForm } from "./parts/sign-up-form";

export const authOptions = ["google"];

export type AuthFormProps = {
  showTitle?: boolean;
  // modal form to be displayed
  isSignIn: boolean;
  setIsSignIn: (value: boolean) => void;
  // outer control for modal
  setAuthModalOpen: (value: boolean) => void;
};

export type AuthErrorType = {
  type: string;
  message: string;
  code: string;
};

export function AuthForm(props: AuthFormProps) {
  const { isSignIn = true, setIsSignIn } = props;

  const [authError, setAuthError] = useState<AuthErrorType>();
  const [authButtonsDisabled, setAuthButtonsDisabled] = useState(false);

  useEffect(() => {
    setAuthError(undefined);
  }, [isSignIn]);

  return (
    <div className="w-full">
      {isSignIn ? (
        <LoginForm
          {...props}
          authButtonsDisabled={authButtonsDisabled}
          setIsSignIn={setIsSignIn}
          authError={authError}
          setAuthError={setAuthError}
        />
      ) : (
        <SignUpForm
          {...props}
          authButtonsDisabled={authButtonsDisabled}
          setIsSignIn={setIsSignIn}
          authError={authError}
          setAuthError={setAuthError}
        />
      )}
    </div>
  );
}
