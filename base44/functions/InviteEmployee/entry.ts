import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Invites a new employee: generates EMP number, creates linked Member record,
// creates Employee record, and sends platform invite email.
// The employee is invited as an admin-level app user so RLS permits entity reads
// in the Employee Portal. Their Employee.permitted_tabs controls which tabs they see.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, full_name, permitted_tabs } = body || {};
    if (!email) return Response.json({ error: 'email is required' }, { status: 400 });

    // Check for duplicate
    const existing = await base44.asServiceRole.entities.Employee.filter({ email });
    if (existing.length > 0) return Response.json({ error: 'Employee with this email already exists' }, { status: 400 });

    // Generate next EMP number
    const employees = await base44.asServiceRole.entities.Employee.list();
    const maxNum = employees.reduce((max, e) => {
      const match = (e.emp_number || '').match(/EMP(\d+)/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const empNumber = `EMP${String(maxNum + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().slice(0, 10);

    // Create linked Member record for gym membership
    const member = await base44.asServiceRole.entities.Member.create({
      full_name: full_name || email.split('@')[0],
      date_joined: today,
      membership_tier: 'Pro',
      status: 'active',
      card_id: empNumber,
      email,
    });

    // Create Employee record
    const employee = await base44.asServiceRole.entities.Employee.create({
      emp_number: empNumber,
      email,
      full_name: full_name || '',
      permitted_tabs: permitted_tabs || [],
      member_id: member.id,
      active: true,
      invited_date: today,
    });

    // Invite user as admin (for RLS access in Employee Portal)
    try {
      await base44.asServiceRole.users.inviteUser(email, 'admin');
    } catch (e) {
      // User may already exist — continue
    }

    // Send email with EMP number (best-effort)
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `Your SR FITS Employee Portal Access — ${empNumber}`,
        body: `Hi ${full_name || 'there'},\n\nYou've been invited to the SR FITS Employee Portal.\n\nYour Employee Number (EMP): ${empNumber}\nAssigned Duties: ${(permitted_tabs || []).length ? (permitted_tabs || []).join(', ') : 'Personal information only'}\n\nPlease accept the separate app invitation email to set up your password, then log in and navigate to the Employee Portal to enter your EMP number.\n\n— SR FITS Management`,
      });
    } catch (e) {
      // Credits may be exhausted — return EMP number to caller instead
    }

    return Response.json({ employee, emp_number: empNumber });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}