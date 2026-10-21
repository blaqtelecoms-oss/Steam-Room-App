import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Returns the employee record and permitted admin tabs for a given email.
// Used by the Admin console to determine role-based tab visibility.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const email = body?.email;
    if (!email) return Response.json({ employee: null });

    const employees = await base44.asServiceRole.entities.Employee.list();
    const employee = employees.find(
      (e) => e.email && e.email.toLowerCase() === email.toLowerCase()
    );

    if (!employee || !employee.active) return Response.json({ employee: null });

    const permitted_tabs = employee.permitted_tabs || [];
    return Response.json({ employee, permitted_tabs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}