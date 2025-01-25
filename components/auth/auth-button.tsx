"use client";

import { useState } from "react";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import Loader from "../loader";
import { Button } from "../ui/button";
import { signInWithOAuth } from "../../lib/utils/auth.utils";

function AuthButton(props: { type: string; disabled?: boolean }) {
  const { type, disabled = false } = props;

  const [isButtonLoading, setButtonLoading] = useState(false);

  let socialIcon = null;

  if (!type) {
    return <></>;
  }

  if (type === "google") {
    socialIcon = <IconBrandGoogleFilled size={19} />;
  }

  return (
    <Button
      type="button"
      onClick={async () => {
        setButtonLoading(true);

        await signInWithOAuth(type as "google" | "x" | "facebook");

        setTimeout(() => {
          setButtonLoading(false);
        }, 2000);
      }}
      disabled={disabled}
      className="w-fit flex-1"
    >
      <span className="flex items-center gap-2">
        <span>
          {isButtonLoading ? (
            <Loader className="inline" size={18} />
          ) : (
            socialIcon
          )}
        </span>
      </span>
    </Button>
  );
}

export default AuthButton;
