import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email } = body;

    if (!email || typeof email !== "string") {
      console.log("Invalid email in request:", { email });
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("Processing password reset request for:", email);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      console.log("No user found with email:", email);
      // Return success even if user doesn't exist for security
      return NextResponse.json({
        message:
          "If an account exists, you will receive a password reset email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    console.log("Generated reset token for user:", {
      userId: user.id,
      tokenLength: resetToken.length,
      expiry: resetTokenExpiry,
    });

    try {
      // Save reset token to user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Generate reset link
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

      console.log("Attempting to send reset email to:", email);

      // Send the reset email
      const emailResult = await sendPasswordResetEmail(email, resetLink);

      console.log("Reset email sent successfully:", {
        messageId: emailResult?.messageId,
      });

      return NextResponse.json({
        message:
          "If an account exists, you will receive a password reset email",
      });
    } catch (error) {
      console.error("Error in password reset process:", {
        error,
        userId: user.id,
        email: user.email,
      });
      // Don't expose internal errors to the client
      return NextResponse.json(
        { error: "Unable to process password reset request" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
