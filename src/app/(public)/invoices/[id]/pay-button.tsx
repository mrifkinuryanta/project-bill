"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

import { toast } from "sonner";

const TRANSLATIONS = {
  en: {
    title: "Online Payment Available",
    description: "You can now pay this invoice securely online via Credit Card, QRIS, Virtual Account, or E-Wallet.",
    payNow: "Pay",
    now: "Now",
  },
  id: {
    title: "Pembayaran Online Tersedia",
    description: "Anda dapat membayar invoice ini secara online melalui Kartu Kredit, QRIS, Virtual Account, atau E-Wallet.",
    payNow: "Bayar",
    now: "Sekarang",
  },
};

export function PayButton({
  invoiceId,
  amountStr,
  lang = "id",
}: {
  invoiceId: string;
  amountStr: string;
  lang?: "id" | "en";
}) {
  const [isLoading, setIsLoading] = useState(false);
  const t = TRANSLATIONS[lang];

  const handlePayClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      // Redirect the user to the Mayar payment link
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error("No payment link returned");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 border-l-4 border-blue-600 mb-6 print:hidden">
      <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm mb-2">
        {t.title}
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        {t.description}
      </p>
      <Button
        onClick={handlePayClick}
        disabled={isLoading}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4 mr-2" />
        )}
        {t.payNow} {amountStr} {t.now}
      </Button>
    </div>
  );
}
