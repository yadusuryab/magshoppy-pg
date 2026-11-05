import { CheckoutStep } from "@/lib/types/checkout";

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "payment", label: "Order summary" },
  { key: "details", label: "Delivery details" },
];

export function StepProgress({ currentStep }: { currentStep: CheckoutStep }) {
  const activeIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <nav aria-label="Checkout progress" className="mx-auto mb-8 w-full max-w-md">
      <ol className="flex gap-2">
        {STEPS.map((step, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;

          return (
            <li key={step.key} aria-current={active ? "step" : undefined} className="flex-1">
              <div
                aria-hidden
                className={`h-1 rounded-full transition-colors duration-300 ${
                  done || active ? "bg-black" : "bg-neutral-200"
                }`}
              />
              <p
                className={`mt-2 text-sm tracking-tight ${
                  active
                    ? "font-extrabold text-neutral-950"
                    : done
                    ? "font-semibold text-neutral-950"
                    : "font-medium text-neutral-400"
                }`}
              >
                {done ? "✓" : i + 1}&nbsp; {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}