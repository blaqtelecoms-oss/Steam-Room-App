import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Authenticates an employee via their EMP number.
// Verifies the EMP number belongs to the logged-in user's email.
// Returns employee record + linked member data for portal display.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { empNumber, userEmail } = body || {};
    if (!empNumber) return Response.json({ error: 'EMP number is required' }, { status: 400 });

    const normalized = empNumber.trim().toUpperCase();
    const employees = await base44.asServiceRole.entities.Employee.filter({ emp_number: normalized });
    if (employees.length === 0) return Response.json({ error: 'Employee not found' }, { status: 404 });

    const employee = employees[0];
    if (!employee.active) return Response.json({ error: 'Employee account is inactive. Contact management.' }, { status: 403 });

    // Verify the EMP number belongs to the logged-in user
    if (userEmail && employee.email.toLowerCase() !== userEmail.toLowerCase()) {
      return Response.json({ error: 'This EMP number does not belong to your account.' }, { status: 403 });
    }

    // Get linked member data
    let member = null;
    if (employee.member_id) {
      try {
        member = await base44.asServiceRole.entities.Member.get(employee.member_id);
      } catch {}
    }

    // Update accepted_date on first login
    if (!employee.accepted_date) {
      try {
        await base44.asServiceRole.entities.Employee.update(employee.id, {
          accepted_date: new Date().toISOString().slice(0, 10),
          user_id: body?.userId || '',
        });
      } catch {}
    }

    return Response.json({ employee, member });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}