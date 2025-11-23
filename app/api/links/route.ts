import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// Random shortcode generator
function generateCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const len = Math.floor(Math.random() * 3) + 6; // 6–8
  let code = "";
  for (let i = 0; i < len; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const codeRegex = /^[A-Za-z0-9]{6,8}$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body.url?.trim();
  const customCode = body.code?.trim();

  // Validate URL
  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Validate custom code
  if (customCode && !codeRegex.test(customCode)) {
    return NextResponse.json(
      { error: "Code must be 6–8 alphanumeric characters" },
      { status: 400 }
    );
  }

  // Determine the code to use
  const code = customCode || generateCode();

  // Must check if exists
  const exists = await prisma.link.findUnique({ where: { code } });
  if (exists) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  // Create new link
  const link = await prisma.link.create({
    data: { code, url },
  });

  return NextResponse.json(link, { status: 201 });
}

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}
