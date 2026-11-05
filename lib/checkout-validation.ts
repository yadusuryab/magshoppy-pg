export type CustomerDetails = {
  name: string;
  contact1: string;
  contact2?: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  instagramId?: string;
};

const REQUIRED: (keyof CustomerDetails)[] = [
  "name", "contact1", "address", "district", "state", "pincode",
];

export function validateCustomer(c: Partial<CustomerDetails>): string[] {
  const errors: string[] = [];
  for (const f of REQUIRED) {
    if (!c[f] || !String(c[f]).trim()) errors.push(`${f} is required`);
  }
  if (c.contact1 && !/^\d{10}$/.test(c.contact1.trim()))
    errors.push("contact1 must be a 10-digit number");
  if (c.contact2 && c.contact2.trim() && !/^\d{10}$/.test(c.contact2.trim()))
    errors.push("contact2 must be a 10-digit number");
  if (c.pincode && !/^\d{6}$/.test(c.pincode.trim()))
    errors.push("pincode must be a 6-digit number");
  return errors;
}