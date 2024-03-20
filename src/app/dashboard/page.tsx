import Dashboard from "@/components/Dashboard";
import { linkAuthCallback } from "@/constants/link-href";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) redirect(`${linkAuthCallback}?origin=dasboard`);
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });
  if (!dbUser) redirect(`${linkAuthCallback}?origin=dasboard`);
  return <Dashboard></Dashboard>;
}
