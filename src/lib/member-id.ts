import { getSiteSettings } from "@/lib/site-settings";
import { prisma } from "@/lib/prisma";

const DEFAULT_MEMBER_ID_PREFIX = "MEM";

export function normalizeMemberIdPrefix(value?: string | null) {
  const normalized = (value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);

  return normalized || DEFAULT_MEMBER_ID_PREFIX;
}

export function formatMemberId(prefix: string, sequence: number) {
  return `${normalizeMemberIdPrefix(prefix)}-${String(sequence).padStart(4, "0")}`;
}

function parseMemberIdSequence(memberId: string, prefix: string) {
  const normalizedPrefix = normalizeMemberIdPrefix(prefix);
  const match = memberId.match(new RegExp(`^${normalizedPrefix}-(\\d+)$`));

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export async function getNextMemberId(prefix?: string) {
  const resolvedPrefix = prefix ? normalizeMemberIdPrefix(prefix) : normalizeMemberIdPrefix((await getSiteSettings()).memberIdPrefix);
  const existingIds = await prisma.member.findMany({
    where: { memberId: { startsWith: `${resolvedPrefix}-` } },
    select: { memberId: true },
  });

  const maxSequence = existingIds.reduce((currentMax, member) => {
    const sequence = parseMemberIdSequence(member.memberId, resolvedPrefix);
    return sequence && sequence > currentMax ? sequence : currentMax;
  }, 0);

  return formatMemberId(resolvedPrefix, maxSequence + 1);
}