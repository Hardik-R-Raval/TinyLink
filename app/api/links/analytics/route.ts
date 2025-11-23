import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  // Total links
  const totalLinks = await prisma.link.count();

  // Total clicks
  const totalClicksResult = await prisma.link.aggregate({
    _sum: { clicks: true },
  });

  const totalClicks = totalClicksResult._sum.clicks ?? 0;

  // Most-clicked links (top 5)
  const topLinks = await prisma.link.findMany({
    orderBy: { clicks: "desc" },
    take: 5,
    select: {
      code: true,
      url: true,
      clicks: true,
      lastClicked: true,
    },
  });

  // Recent 10 created links
  const recentLinks = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      code: true,
      url: true,
      createdAt: true,
      clicks: true,
    },
  });

  return NextResponse.json({
    totalLinks,
    totalClicks,
    topLinks,
    recentLinks,
  });
}
