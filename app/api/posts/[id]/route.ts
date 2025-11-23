import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <- params is a Promise
) {
  const { id } = await params; // <- await before using
  const link = await prisma.link.findUnique({
    where: { code: id },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(link);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (!body.url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const updated = await prisma.link.update({
    where: { code: id },
    data: { url: body.url },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.link.delete({
      where: { code: id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
