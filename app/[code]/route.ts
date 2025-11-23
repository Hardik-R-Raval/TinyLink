import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";

const codeRegex = /^[A-Za-z0-9]{6,8}$/;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> } // params is now a Promise
) {
  // Await the params
  const { code } = await context.params;
  const trimmedCode = code.trim();

  // Validate short code
  if (!codeRegex.test(trimmedCode)) {
    return NextResponse.json(
      { error: "Invalid code format" },
      { status: 400 }
    );
  }

  // Find the record
  const link = await prisma.link.findUnique({
    where: { code: trimmedCode },
  });

  if (!link) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  // Update stats before redirect
  await prisma.link.update({
    where: { code: trimmedCode },
    data: {
      clicks: link.clicks + 1,
      lastClicked: new Date(),
    },
  });

  // Redirect to target URL
  return NextResponse.redirect(link.url, 302);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const trimmedCode = code.trim();

  // Validate code
  if (!codeRegex.test(trimmedCode)) {
    return NextResponse.json(
      { error: "Invalid code format" },
      { status: 400 }
    );
  }

  try {
    await prisma.link.delete({ where: { code: trimmedCode } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Not found or already deleted" },
      { status: 404 }
    );
  }
}
