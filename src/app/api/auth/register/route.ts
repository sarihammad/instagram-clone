import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password)
      return new Response("Missing fields", { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return new Response("User already exists", { status: 409 });

    const hashedPassword = await hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, hashedPassword },
    });

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch {
    return new Response("Error creating user", { status: 500 });
  }
}
