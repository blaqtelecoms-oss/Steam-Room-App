import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// South African ID number: first 6 digits are YYMMDD.
function birthFromID(idNumber) {
  const digits = (idNumber || '').replace(/\D/g, '');
  if (digits.length < 6) return null;
  const mm = parseInt(digits.slice(2, 4), 10);
  const dd = parseInt(digits.slice(4, 6), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return { month: mm, day: dd };
}

function todayInZA() {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Johannesburg', month: '2-digit', day: '2-digit' });
  const parts = fmt.formatToParts(new Date());
  const month = parseInt(parts.find((p) => p.type === 'month').value, 10);
  const day = parseInt(parts.find((p) => p.type === 'day').value, 10);
  return { month, day };
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    // Allow scheduled runs (no user) and admin manual runs; block regular users from triggering it.
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { month, day } = todayInZA();

    const [members, mandates] = await Promise.all([
      base44.asServiceRole.entities.Member.filter({ status: 'active' }, '-created_date', 500),
      base44.asServiceRole.entities.Mandate.filter({}, '-created_date', 500),
    ]);

    // Build a member_id -> mandate lookup so the ID number can come from either place.
    const mandateByMember = {};
    for (const m of mandates) {
      if (m.member_id && !mandateByMember[m.member_id]) mandateByMember[m.member_id] = m;
    }

    let sent = 0;
    const names = [];
    for (const member of members) {
      const mandate = mandateByMember[member.id];
      const idType = member.id_type || mandate?.id_type || 'RSA ID';
      if (idType !== 'RSA ID') continue;
      const b = birthFromID(member.id_number || mandate?.id_number);
      if (!b || b.month !== month || b.day !== day) continue;

      const email = (member.email || mandate?.email_address || '').trim();
      const name = member.full_name || '';
      if (!email) continue;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'Happy Birthday from SR FITS! 🎉',
          body: `Hi ${name},\n\nWishing you a very happy birthday from everyone at Steam Room Fitness Center! 🎂\n\nMay this year bring you strength, gains and goals smashed. Your membership means the world to us — come celebrate with a workout on us today.\n\nSteam Room Fitness Center`,
        });
        sent++;
        names.push(name || email);
      } catch { /* skip failed send */ }
    }

    return Response.json({ sent, birthdays: names, date: `${month}/${day}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}