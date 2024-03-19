import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf
  const body = await req.json();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) return new Response("Unauthorized", { status: 401 });

  const { fileId, message } = SendMessageValidator.parse(body);
  // get file
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id!,
    },
  });
  if (!file) return new Response("Not Found", { status: 404 });
  // set message to file
  const result = await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId: user.id!,
      fileId,
    },
  });
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
