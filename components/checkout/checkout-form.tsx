import type { ChangeEvent, FocusEvent } from "react";

type Details = {
  name: string;
  contact1: string;
  contact2: string;
  address: string;
  district: string;
  state: string;
  instagramId: string;
  pincode: string;
  landmark: string;
};

interface CustomerDetailsFormProps {
  customerDetails: Details;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleInputBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  getFieldError?: (field: string) => string | undefined;
}

type FieldDef = {
  name: keyof Details;
  label: string;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  area?: boolean;
  /** digits only, capped at this length */
  digits?: number;
};

// Rows with two fields sit side by side on larger screens
const ROWS: FieldDef[][] = [
  [{ name: "name", label: "Full name", placeholder: "Enter your full name", autoComplete: "name", required: true }],
  [
    { name: "contact1", label: "Primary phone", placeholder: "10-digit mobile number", autoComplete: "tel-national", required: true, digits: 10 },
    { name: "contact2", label: "Secondary phone", placeholder: "Alternative number", autoComplete: "off", digits: 10 },
  ],
  [{ name: "instagramId", label: "Instagram username", placeholder: "@yourusername", autoComplete: "off" }],
  [{ name: "address", label: "Complete address", placeholder: "House no, building, street, area", autoComplete: "street-address", required: true, area: true }],
  [{ name: "landmark", label: "Landmark", placeholder: "Nearby famous place, shop, or building", autoComplete: "off" }],
  [
    { name: "district", label: "District", placeholder: "Your district", autoComplete: "address-level2", required: true },
    { name: "state", label: "State", placeholder: "Your state", autoComplete: "address-level1", required: true },
  ],
  [{ name: "pincode", label: "Pincode", placeholder: "6-digit pincode", autoComplete: "postal-code", required: true, digits: 6 }],
];

const base =
  "mt-1.5 w-full rounded-xl border bg-muted/30 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2";
const ok = "border-border focus:ring-indigo-600/40";
const bad = "border-red-400 bg-red-50/50 focus:ring-red-400";

export const CustomerDetailsForm = ({
  customerDetails,
  handleInputChange,
  handleInputBlur,
  getFieldError,
}: CustomerDetailsFormProps) => (
  <div className="space-y-4">
    {ROWS.map((row) => (
      <div
        key={row[0].name}
        className={row.length > 1 ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : undefined}
      >
        {row.map((f) => {
          const error = getFieldError?.(f.name);
          const common = {
            id: f.name,
            name: f.name,
            value: customerDetails[f.name],
            placeholder: f.placeholder,
            autoComplete: f.autoComplete,
            onBlur: handleInputBlur,
            "aria-invalid": !!error,
            "aria-required": f.required,
            "aria-describedby": error ? `${f.name}-error` : undefined,
            onChange: f.digits
              ? (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                  let v = e.target.value.replace(/\D/g, "");
                  // autofill / paste like "+91 98765 43210"
                  if (f.digits === 10 && v.length === 12 && v.startsWith("91")) v = v.slice(2);
                  e.target.value = v.slice(0, f.digits);
                  handleInputChange(e);
                }
              : handleInputChange,
          };

          return (
            <div key={f.name}>
              <label htmlFor={f.name} className="text-xs font-medium text-muted-foreground">
                {f.label}
                {f.required && " *"}
              </label>
              {f.area ? (
                <textarea {...common} rows={3} className={`${base} min-h-[80px] py-2.5 ${error ? bad : ok}`} />
              ) : (
                <input
                  {...common}
                  type={f.digits ? "tel" : "text"}
                  inputMode={f.digits ? "numeric" : undefined}
                  maxLength={f.digits}
                  enterKeyHint="next"
                  className={`${base} h-11 ${error ? bad : ok}`}
                />
              )}
              {error && (
                <p id={`${f.name}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);