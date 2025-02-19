"use server";

import { createClient } from "@/lib/utils/supabase/server";
import type { User } from "@supabase/supabase-js";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const getServerUser: () => Promise<User | null> = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// --- sign in ---
export async function login(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log(error);
    if (error?.["__isAuthError"] && error?.code) {
      return getAuthErrorMessage(error.code);
    } else {
      return false;
    }
  }

  revalidatePath("/", "layout");
  return true;
}

export async function signInWithOAuth(type: "x" | "google" | "facebook") {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: type === "x" ? "twitter" : type,
    options: {
      redirectTo:
        process.env.APP_ENV === "local"
          ? "http://localhost:3000"
          : process.env.APP_ENV === "staging"
          ? process.env.VERCEL_URL
          : "https://www.moodly.world",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    if (error?.["__isAuthError"] && error?.code) {
      return getAuthErrorMessage(error.code);
    } else {
      return false;
    }
  }

  redirect(data.url);
}

// --- sign up ---
export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm-password") as string,
    options: {
      data: {
        full_name: `${firstName + " " + lastName}`,
        email: formData.get("email") as string,
      },
    },
  };

  if (data?.password !== data?.confirm_password) {
    return { type: "error", message: "Passwords do not match." };
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.log(error);
    if (error?.["__isAuthError"] && error?.code) {
      return getAuthErrorMessage(error.code);
    } else {
      return false;
    }
  }

  revalidatePath("/", "layout");
  return true;
}

export async function signout() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log(error);
    if (error?.["__isAuthError"] && error?.code) {
      return getAuthErrorMessage(error.code);
    } else {
      return false;
    }
  }
  revalidatePath("/", "layout");
  return true;
}

// --- helper functions ---
function getAuthErrorMessage(code_message: string) {
  let message = "An error occurred";

  switch (code_message) {
    case "invalid_credentials":
      message = "Invalid email address and/or password.";
      break;
    case "weak_password":
      message =
        "Password must be at least 6 characters long and include a mix of letters and numbers.";
      break;
    case "user_already_exists":
      message =
        "User already exists. Please ensure you're using new credentials.";
      break;
    case "user_not_found":
      message = "User not found.";
      break;
    case "provider_email_needs_verification.":
      message =
        "Email needs verification. Please check your inbox to verify your account.";
      break;
  }

  return {
    code: code_message,
    message: message?.toString(),
  };
}
