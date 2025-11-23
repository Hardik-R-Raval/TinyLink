import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const codeRegex = /^[A-Za-z0-9]{6,8}$/;

// Helper to safely unwrap params.code
async function getCode(params: { code?: string } | Promise<{ code?: string }>) {
  const resolved = "then" in params ? await params : params;
  const code = resolved.code?.trim();
  if (!code) throw new Error("Missing code");
  if (!codeRegex.test(code)) throw new Error("Invalid code format");
  return code;
}

// DELETE handler logic
async function handleDelete(code: string) {
  try {
    await prisma.link.delete({ where: { code } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found or already deleted" }, { status: 404 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { code: string } } | { params: Promise<{ code: string }> }
) {
  try {
    const code = await getCode(context.params);

    const link = await prisma.link.findUnique({ where: { code } });
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Optionally, update clicks on GET if needed
    await prisma.link.update({
      where: { code },
      data: { clicks: link.clicks + 1, lastClicked: new Date() },
    });

    return NextResponse.json(link);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { code: string } } | { params: Promise<{ code: string }> }
) {
  try {
    const code = await getCode(context.params);

    // Method override for DELETE
    const method = req.nextUrl.searchParams.get("_method");
    if (method === "DELETE") return handleDelete(code);

    return NextResponse.json({ error: "Unsupported POST action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { code: string } } | { params: Promise<{ code: string }> }
) {
  try {
    const code = await getCode(context.params);
    return handleDelete(code);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { code: string } } | { params: Promise<{ code: string }> }
) {
  try {
    const oldCode = await getCode(context.params);
    const body = await req.json();
    const { url, newCode } = body;

    if (newCode && !codeRegex.test(newCode.trim())) {
      return NextResponse.json(
        { error: "New code must be 6–8 alphanumeric characters" },
        { status: 400 }
      );
    }

    const updated = await prisma.link.update({
      where: { code: oldCode },
      data: {
        url: url?.trim() || undefined,
        code: newCode?.trim() || undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 400 });
  }
}
