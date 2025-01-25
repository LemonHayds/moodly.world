"use server";

import { headers } from "next/headers";
import { getServerUser } from "@/lib/utils/auth.utils";
import AuthClientProvider from "./auth-client-provider";
import MoodLogServerProvider from "../mood-log-provider/mood-log-server-provider";

export async function AuthServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  headers();
  const user = await getServerUser();

  return (
    <AuthClientProvider initialUser={user || undefined}>
      <MoodLogServerProvider initialUser={user || undefined}>
        {children}
      </MoodLogServerProvider>
    </AuthClientProvider>
  );
}

export default AuthServerProvider;
