import { useEffect, useId, useMemo, useRef, useState } from "react";
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

type FieldEl = HTMLInputElement | HTMLTextAreaElement;

interface CustomerDetailsFormProps {
  customerDetails: Details;
  handleInputChange: (e: ChangeEvent<FieldEl>) => void;
  handleInputBlur?: (e: FocusEvent<FieldEl>) => void;
  getFieldError?: (field: string) => string | undefined;
}

type FieldDef = {
  name: keyof Details;
  label: string;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  area?: boolean;
  /** searchable state picker */
  select?: boolean;
  /** digits only, capped at this length */
  digits?: number;
};

// Kerala first, then everything else alphabetically
const STATES = [
  "Kerala",
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

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
    { name: "state", label: "State", placeholder: "Search or select state", autoComplete: "off", required: true, select: true },
  ],
  [{ name: "pincode", label: "Pincode", placeholder: "6-digit pincode", autoComplete: "postal-code", required: true, digits: 6 }],
];

const base =
  "mt-1.5 w-full rounded-xl border bg-muted/30 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2";
const ok = "border-border focus:ring-indigo-600/40";
const bad = "border-red-400 bg-red-50/50 focus:ring-red-400";

type ComboProps = {
  id: string;
  value: string;
  placeholder: string;
  invalid: boolean;
  required?: boolean;
  describedBy?: string;
  onSelect: (value: string) => void;
  onBlurField: () => void;
};

const StateCombobox = ({ id, value, placeholder, invalid, required, describedBy, onSelect, onBlurField }: ComboProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATES;
    const starts = STATES.filter((s) => s.toLowerCase().startsWith(q));
    const contains = STATES.filter((s) => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q));
    return [...starts, ...contains];
  }, [query]);

  // keep the highlighted option visible while using arrow keys
  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  const openList = () => {
    if (open) return;
    setQuery("");
    setActive(Math.max(0, STATES.indexOf(value)));
    setOpen(true);
  };

  const choose = (s: string) => {
    onSelect(s);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) return openList();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onBlur={(e) => {
        // only react when focus leaves the whole widget
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
          setQuery("");
          onBlurField();
        }
      }}
    >
      <input
        id={id}
        name="state"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
        aria-invalid={invalid}
        aria-required={required}
        aria-describedby={describedBy}
        autoComplete="off"
        value={open ? query : value}
        placeholder={open && value ? value : placeholder}
        onFocus={openList}
        onClick={openList}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        enterKeyHint="next"
        className={`${base} h-11 pr-9 ${invalid ? bad : ok}`}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-[calc(50%+3px)] h-4 w-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-background py-1 text-sm shadow-lg"
        >
          {filtered.length === 0 && <li className="px-3 py-2 text-muted-foreground">No matching state</li>}
          {filtered.map((s, i) => (
            <li
              key={s}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={s === value}
              // mousedown (not click) so the input keeps focus
              onMouseDown={(e) => {
                e.preventDefault();
                choose(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-2 ${i === active ? "bg-indigo-600/10" : ""} ${s === value ? "font-medium" : ""}`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
          const describedBy = error ? `${f.name}-error` : undefined;
          const common = {
            id: f.name,
            name: f.name,
            value: customerDetails[f.name],
            placeholder: f.placeholder,
            autoComplete: f.autoComplete,
            onBlur: handleInputBlur,
            "aria-invalid": !!error,
            "aria-required": f.required,
            "aria-describedby": describedBy,
            onChange: f.digits
              ? (e: ChangeEvent<FieldEl>) => {
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
              {f.select ? (
                <StateCombobox
                  id={f.name}
                  value={customerDetails.state}
                  placeholder={f.placeholder}
                  invalid={!!error}
                  required={f.required}
                  describedBy={describedBy}
                  onSelect={(v) =>
                    handleInputChange({ target: { name: "state", value: v } } as unknown as ChangeEvent<HTMLInputElement>)
                  }
                  onBlurField={() =>
                    handleInputBlur?.({
                      target: { name: "state", value: customerDetails.state },
                    } as unknown as FocusEvent<HTMLInputElement>)
                  }
                />
              ) : f.area ? (
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