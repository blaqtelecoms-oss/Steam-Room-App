import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { computeCredit } from '../../shared/credit.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const memberId = body?.member_id;
    if (!memberId) return Response.json({ error: 'member_id is required' }, { status: 400 });

    const member = await base44.entities.Member.get(memberId);
    if (!member) return Response.json({ error: 'Member not found' }, { status: 404 });

    const payments = await base44.entities.Payment.filter({ member_id: memberId }, '-date', 500);
    const { good, overdue, streak, creditLimit, creditBalance } = computeCredit(payments || []);

    await base44.entities.Member.update(memberId, {
      credit_limit: creditLimit,
      credit_balance: creditBalance,
      credit_streak: streak,
    });

    return Response.json({
      member_id: memberId,
      good_payments: good,
      overdue_payments: overdue,
      streak,
      credit_limit: creditLimit,
      credit_balance: creditBalance,
      available_credit: creditLimit - creditBalance,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}