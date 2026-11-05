import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";

interface PaymentMethodProps {
  paymentMethod: "upi" | "cod";
  handlePaymentChange: (method: "upi" | "cod") => void;
  handleCheckout: (transactionId?: string) => void;
  isLoading: boolean;
  totalAmount: number;
}

export const PaymentMethod = ({
  paymentMethod,
  handlePaymentChange,
  handleCheckout,
  isLoading,
  totalAmount,
}: PaymentMethodProps) => {
  const [transactionId, setTransactionId] = useState("");
  const [showQR, setShowQR] = useState(false);
  
  // Replace with your actual UPI ID
  const upiId = "shoeshubkerala@axl";
  const codAdvanceAmount = 300; // Fixed COD advance amount

  // Generate UPI payment link with amount
  const generateUpiLink = (amount: number) => {
    return `upi://pay?pa=${upiId}&pn=footex&am=${amount}&cu=INR&tn=Payment for order`;
  };

  // Open UPI app with prefilled amount
  const openUpiApp = (amount: number) => {
    window.location.href = generateUpiLink(amount);
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={handlePaymentChange} value={paymentMethod}>
        <SelectTrigger>
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="upi">UPI Payment (Full Amount: ₹{totalAmount})</SelectItem>
          <SelectItem value="cod">
            Cash on Delivery (₹{codAdvanceAmount} Advance + ₹{totalAmount - codAdvanceAmount} on Delivery)
          </SelectItem>
        </SelectContent>
      </Select>

      {paymentMethod === "upi" ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowQR(!showQR)}
            >
              {showQR ? "Hide UPI QR Code" : "Show UPI QR Code"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => openUpiApp(totalAmount)}
            >
              Open UPI App
            </Button>
          </div>

          {showQR && (
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <div className="mb-2 text-sm font-medium">
                Scan to pay ₹{totalAmount}
              </div>
              <div className="p-2 border rounded">
                <QRCodeCanvas 
                  value={generateUpiLink(totalAmount)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                UPI ID: {upiId}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Input
              placeholder="Enter UPI Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Please enter the transaction ID from your UPI app after payment
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded-lg ">
          <p className="text-sm font-medium">
            ₹{codAdvanceAmount} will be collected upfront via UPI
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Remaining ₹{totalAmount - codAdvanceAmount} will be paid in cash on delivery
          </p>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowQR(!showQR)}
            >
              {showQR ? "Hide QR Code" : "Show QR Code"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => openUpiApp(codAdvanceAmount)}
            >
              Pay ₹{codAdvanceAmount} Now
            </Button>
          </div>

          {showQR && (
            <div className="flex flex-col items-center p-4 mt-4 border rounded-lg">
              <div className="mb-2 text-sm font-medium">
                Scan to pay ₹{codAdvanceAmount}
              </div>
              <div className="p-2 border rounded">
                <QRCodeCanvas 
                  value={generateUpiLink(codAdvanceAmount)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                UPI ID: {upiId}
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <Input
              placeholder="Enter UPI Transaction ID for ₹{codAdvanceAmount}"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Please enter the transaction ID after paying ₹{codAdvanceAmount} advance
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-1 w-full">
        <p>By placing order you agree to our </p>
        <Link href="/T&C" className="text-bw hover:underline">
          Terms & Conditions.
        </Link>
      </div>

      <Button 
        className="w-full" 
        onClick={() => handleCheckout(transactionId)}
        disabled={
          isLoading || 
          !transactionId // Require UPI transaction ID for both payment methods
        }
      >
        {isLoading ? "Processing..." : "Place Order"}
      </Button>
    </div>
  );
};