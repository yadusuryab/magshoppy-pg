import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerDetailsFormProps {
  customerDetails: {
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
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  // Both optional so this form still works in places that only validate
  // on submit (no per-field errors) rather than on blur.
  handleInputBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  getFieldError?: (field: string) => string | undefined;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

export const CustomerDetailsForm = ({
  customerDetails,
  handleInputChange,
  handleInputBlur,
  getFieldError,
}: CustomerDetailsFormProps) => {
  const errorFor = (field: string) => getFieldError?.(field);

  const fieldClass = (field: string) =>
    cn(
      "mt-1",
      errorFor(field) && "border-red-500 focus-visible:ring-red-500"
    );

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your full name"
            value={customerDetails.name}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-invalid={!!errorFor("name")}
            className={fieldClass("name")}
          />
          <FieldError message={errorFor("name")} />
        </div>
      </div>

      {/* Contact Numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact1">
            Primary Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contact1"
            name="contact1"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={customerDetails.contact1}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-invalid={!!errorFor("contact1")}
            className={fieldClass("contact1")}
          />
          <FieldError message={errorFor("contact1")} />
        </div>
        <div>
          <Label htmlFor="contact2">Secondary Phone (Optional)</Label>
          <Input
            id="contact2"
            name="contact2"
            inputMode="numeric"
            placeholder="Alternative number"
            value={customerDetails.contact2}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-invalid={!!errorFor("contact2")}
            className={fieldClass("contact2")}
          />
          <FieldError message={errorFor("contact2")} />
        </div>
      </div>

      {/* Instagram */}
      <div>
        <Label htmlFor="instagramId">Instagram Username (Optional)</Label>
        <Input
          id="instagramId"
          name="instagramId"
          placeholder="@yourusername"
          value={customerDetails.instagramId}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="mt-1"
        />
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">
          Complete Address <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="address"
          name="address"
          placeholder="House no, Building, Street, Area"
          value={customerDetails.address}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          aria-invalid={!!errorFor("address")}
          className={cn("min-h-[80px]", fieldClass("address"))}
        />
        <FieldError message={errorFor("address")} />
      </div>

      {/* Landmark */}
      <div>
        <Label htmlFor="landmark">Landmark (Optional)</Label>
        <Input
          id="landmark"
          name="landmark"
          placeholder="Nearby famous place, shop, or building"
          value={customerDetails.landmark}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="mt-1"
        />
      </div>

      {/* District & State */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="district">
            District <span className="text-red-500">*</span>
          </Label>
          <Input
            id="district"
            name="district"
            placeholder="Your district"
            value={customerDetails.district}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-invalid={!!errorFor("district")}
            className={fieldClass("district")}
          />
          <FieldError message={errorFor("district")} />
        </div>
        <div>
          <Label htmlFor="state">
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id="state"
            name="state"
            placeholder="Your state"
            value={customerDetails.state}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-invalid={!!errorFor("state")}
            className={fieldClass("state")}
          />
          <FieldError message={errorFor("state")} />
        </div>
      </div>

      {/* Pincode */}
      <div>
        <Label htmlFor="pincode">
          Pincode <span className="text-red-500">*</span>
        </Label>
        <Input
          id="pincode"
          name="pincode"
          inputMode="numeric"
          placeholder="6-digit pincode"
          value={customerDetails.pincode}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          aria-invalid={!!errorFor("pincode")}
          className={fieldClass("pincode")}
        />
        <FieldError message={errorFor("pincode")} />
      </div>
    </div>
  );
};