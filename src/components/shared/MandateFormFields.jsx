import React from "react";

export const BANKS = ["ABSA BANK", "CAPITEC BANK LIMITED", "FIRST NATIONAL BANK", "FIRSTRAND BANK", "NEDBANK", "STANDARD BANK", "SA BANK OF ATHENS", "AFRICAN BANK", "UBANK LTD", "BIDVEST BANK LIMITED", "FINBOND MUTUAL BANK", "GOTYME BANK"];
export const DEBIT_DAYS = Array.from({ length: 31 }, (_, i) => `${i + 1}st`);

export const EMPTY_MANDATE = {
  membership_type: "", id_type: "RSA ID", id_number: "", other_id: "", cell_number: "", email_address: "",
  address_line1: "", address_line2: "", city: "", region: "", postal_code: "", country: "South Africa",
  nok_name: "", nok_relationship: "", nok_contact: "", nok_alt_contact: "",
  account_holder_type: "Individual", account_holder: "", bank: "", branch_code: "", account_number: "", account_type: "Current (Cheque)",
  contract_reference: "", contract_amount: null, max_collection_amount: null,
  mandate_type: "FIXED", instalment_occurrence: "RECURRING", frequency: "MONTHLY",
  start_date: "", debit_day: "1st", agreed: false,
};

// Coerce empty strings to null for storage, preserving select defaults.
export function buildMandatePayload(form) {
  const payload = { ...form };
  const keepStrings = ["country", "id_type", "account_holder_type", "account_type", "mandate_type", "instalment_occurrence", "frequency", "debit_day"];
  Object.keys(payload).forEach((k) => {
    if (payload[k] === "" && !keepStrings.includes(k)) payload[k] = null;
  });
  return payload;
}

export default function MandateFormFields({ form, upd }) {
  return (
    <>
      <Section title="Membership & Identity">
        <Field label="Membership type" value={form.membership_type || ""} onChange={(v) => upd("membership_type", v)} placeholder="e.g. 12 Month Contract - R350.00" />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="ID type" value={form.id_type} options={["RSA ID", "Other ID"]} onChange={(v) => upd("id_type", v)} />
          {form.id_type === "Other ID" ? (
            <Field label="Other ID" value={form.other_id || ""} onChange={(v) => upd("other_id", v)} />
          ) : (
            <Field label="ID number" value={form.id_number || ""} onChange={(v) => upd("id_number", v)} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cell number" value={form.cell_number || ""} onChange={(v) => upd("cell_number", v)} />
          <Field label="Email address" value={form.email_address || ""} onChange={(v) => upd("email_address", v)} type="email" />
        </div>
      </Section>

      <Section title="Address">
        <Field label="Street address" value={form.address_line1 || ""} onChange={(v) => upd("address_line1", v)} />
        <Field label="Address line 2" value={form.address_line2 || ""} onChange={(v) => upd("address_line2", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" value={form.city || ""} onChange={(v) => upd("city", v)} />
          <Field label="Region / Province" value={form.region || ""} onChange={(v) => upd("region", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Postal code" value={form.postal_code || ""} onChange={(v) => upd("postal_code", v)} />
          <Field label="Country" value={form.country || ""} onChange={(v) => upd("country", v)} />
        </div>
      </Section>

      <Section title="Next of Kin">
        <Field label="Name" value={form.nok_name || ""} onChange={(v) => upd("nok_name", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Relationship" value={form.nok_relationship || ""} onChange={(v) => upd("nok_relationship", v)} />
          <Field label="Contact number" value={form.nok_contact || ""} onChange={(v) => upd("nok_contact", v)} />
        </div>
        <Field label="Alternative contact" value={form.nok_alt_contact || ""} onChange={(v) => upd("nok_alt_contact", v)} />
      </Section>

      <Section title="Bank Account">
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Account holder type" value={form.account_holder_type} options={["Individual", "Company"]} onChange={(v) => upd("account_holder_type", v)} />
          <Field label="Account holder" value={form.account_holder || ""} onChange={(v) => upd("account_holder", v)} />
        </div>
        <SelectField label="Bank" value={form.bank || ""} options={["", ...BANKS]} onChange={(v) => upd("bank", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Branch code" value={form.branch_code || ""} onChange={(v) => upd("branch_code", v)} />
          <Field label="Account number" value={form.account_number || ""} onChange={(v) => upd("account_number", v)} />
        </div>
        <SelectField label="Account type" value={form.account_type} options={["Current (Cheque)", "Savings", "Transmission"]} onChange={(v) => upd("account_type", v)} />
      </Section>

      <Section title="Agreement">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contract reference" value={form.contract_reference || ""} onChange={(v) => upd("contract_reference", v)} />
          <Field label="Contract amount (R)" value={form.contract_amount ?? ""} onChange={(v) => upd("contract_amount", v)} type="number" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Max collection amount (R)" value={form.max_collection_amount ?? ""} onChange={(v) => upd("max_collection_amount", v)} type="number" />
          <SelectField label="Mandate type" value={form.mandate_type} options={["FIXED", "VARIABLE", "USAGE BASED"]} onChange={(v) => upd("mandate_type", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Instalment occurrence" value={form.instalment_occurrence} options={["RECURRING", "ONCE-OFF"]} onChange={(v) => upd("instalment_occurrence", v)} />
          <SelectField label="Frequency" value={form.frequency} options={["MONTHLY", "QUARTERLY", "BI-ANNUALLY", "ANNUALLY", "MONTH-END"]} onChange={(v) => upd("frequency", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date" value={form.start_date || ""} onChange={(v) => upd("start_date", v)} type="date" />
          <SelectField label="Debit day" value={form.debit_day || "1st"} options={DEBIT_DAYS} onChange={(v) => upd("debit_day", v)} />
        </div>
        <label className="flex items-center gap-2 pt-1">
          <input type="checkbox" checked={form.agreed} onChange={(e) => upd("agreed", e.target.checked)} className="w-4 h-4 rounded accent-[hsl(var(--primary))]" />
          <span className="text-xs text-foreground/80">Member agreed to the terms & debit-order authorization</span>
        </label>
      </Section>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-primary/10 pb-1">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {options.map((o) => <option key={o} value={o}>{o || "Select…"}</option>)}
      </select>
    </label>
  );
}