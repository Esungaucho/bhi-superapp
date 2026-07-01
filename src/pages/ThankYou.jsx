import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-2xl text-foreground mb-3">Payment Confirmed</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Thank you for your payment. A confirmation receipt has been sent to your email.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Return to Dashboard
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}