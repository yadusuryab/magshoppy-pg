'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Input } from '../ui/input'
import { QRCodeCanvas } from 'qrcode.react'
import { Loader2 } from 'lucide-react'
import { Badge } from '../ui/badge'

interface PaymentMethodProps {
  paymentMethod: 'online' | 'cod'
  handleCheckout: (transactionId?: string) => void
  totalAmount: number
  isLoading: boolean
}

function Transaction({
  paymentMethod,
  handleCheckout,
  totalAmount,
  isLoading,
}: PaymentMethodProps) {
  const [transactionId, setTransactionId] = useState('')
  const [showQR, setShowQR] = useState(false)

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionId(e.target.value)
  }

  const handlePayment = () => {
    if (paymentMethod === 'online' && !transactionId) {
      alert('Please enter your transaction ID')
      return
    }
    handleCheckout(transactionId)
  }

  const upiLink = `upi://pay?pa=yadusuryab@okhdfcbank&pn=Delta Garage&am=${totalAmount}&tn=OrderPayment`

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>
          By placing order you agree to our{' '}
          <Link href="/T&C" className="underline text-primary">
            Terms & Conditions
          </Link>
          .
        </p>
      </div>

      {paymentMethod === 'online' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-medium">Payment Options</h3>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.open(upiLink)}
              >
                Pay via UPI Apps
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowQR(!showQR)}
                className="w-full sm:w-auto"
              >
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </Button>
            </div>

            {showQR && (
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <QRCodeCanvas
                  value={upiLink}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
                <Badge variant="secondary" className="mt-2">
                  Scan to Pay
                </Badge>
                <p className="text-sm text-muted-foreground">
                  UPI ID: yadusuryab@okhdfcbank
                </p>
                <p className="text-sm font-medium">
                  Amount: ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="transactionId" className="text-sm font-medium">
              Transaction ID
            </label>
            <Input
              id="transactionId"
              placeholder="Enter UPI Transaction Reference ID"
              value={transactionId}
              onChange={handleTransactionIdChange}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Please enter the transaction ID from your payment receipt
            </p>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        onClick={handlePayment}
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Place Order (₹${totalAmount.toLocaleString('en-IN')})`
        )}
      </Button>
    </div>
  )
}

export default Transaction