import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/auth";

type ActivityPoint = {
  date: string;
  label: string;
  pastesCreated: number;
  viewsFromCreated: number;
  sharesFromCreated: number;
};

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const daysInput = Number(searchParams.get("days") ?? "14");
  const days = Number.isFinite(daysInput) ? Math.min(Math.max(Math.floor(daysInput), 7), 90) : 14;

  const today = startOfUtcDay(new Date());
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const pastes = await prisma.paste.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      views: true,
      shares: true,
      language: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPastes = pastes.length;
  const totalViews = pastes.reduce((sum, item) => sum + item.views, 0);
  const totalShares = pastes.reduce((sum, item) => sum + item.shares, 0);

  const mostViewed = pastes.reduce<{
    id: string;
    title: string;
    views: number;
    language: string;
  } | null>((best, item) => {
    if (!best || item.views > best.views) {
      return {
        id: item.id,
        title: item.title,
        views: item.views,
        language: item.language,
      };
    }
    return best;
  }, null);

  const activityMap = new Map<string, ActivityPoint>();
  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    const key = dateKey(day);
    activityMap.set(key, {
      date: key,
      label: formatLabel(day),
      pastesCreated: 0,
      viewsFromCreated: 0,
      sharesFromCreated: 0,
    });
  }

  for (const paste of pastes) {
    const key = dateKey(startOfUtcDay(paste.createdAt));
    const bucket = activityMap.get(key);
    if (!bucket) {
      continue;
    }

    bucket.pastesCreated += 1;
    bucket.viewsFromCreated += paste.views;
    bucket.sharesFromCreated += paste.shares;
  }

  const topPastes = [...pastes]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      title: item.title,
      views: item.views,
      shares: item.shares,
      language: item.language,
    }));

  return NextResponse.json({
    totals: {
      totalPastes,
      totalViews,
      totalShares,
    },
    mostViewed,
    activity: Array.from(activityMap.values()),
    topPastes,
    range: {
      days,
      from: dateKey(start),
      to: dateKey(today),
    },
  });
}
