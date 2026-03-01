import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { PayButton } from "./pay-button"

export default async function InvoiceViewPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const invoice = await prisma.invoice.findUnique({
        where: { id: params.id },
        include: {
            project: {
                include: { client: true }
            }
        }
    })

    if (!invoice) return notFound()

    const formatCurrency = (amount: string | number, currencyStr: string) => {
        return new Intl.NumberFormat(currencyStr === "IDR" ? "id-ID" : "en-US", {
            style: "currency",
            currency: currencyStr,
            minimumFractionDigits: 0
        }).format(Number(amount))
    }

    return (
        <div className="min-h-screen bg-neutral-100 py-10 print:py-0 print:bg-white flex justify-center">
            {/* A4 Container */}
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none p-12 text-slate-900 mx-auto relative flex flex-col">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">ProjectBill Consulting</h1>
                        <p className="text-sm text-slate-500 max-w-[200px]">123 Technology Drive<br />Innovation City, TX 78701<br />contact@projectbill.com</p>
                    </div>
                    <div className="text-right space-y-2">
                        <h2 className="text-4xl font-serif font-bold text-slate-800 tracking-widest uppercase mb-4">Invoice</h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <span className="font-semibold text-slate-500 uppercase">Invoice No:</span>
                            <span className="font-mono font-medium">#{invoice.id.split('-')[0].toUpperCase()}</span>
                            <span className="font-semibold text-slate-500 uppercase">Date:</span>
                            <span className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                            {invoice.dueDate && (
                                <>
                                    <span className="font-semibold text-slate-500 uppercase">Due Date:</span>
                                    <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Badge (Absolute Positioned for style) */}
                <div className="absolute top-12 right-[50%] translate-x-[50%] print:hidden">
                    {invoice.status === 'paid'
                        ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300 text-xs py-1 px-3 uppercase tracking-widest font-bold">Paid</Badge>
                        : <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300 text-xs py-1 px-3 uppercase tracking-widest font-bold">Unpaid</Badge>
                    }
                </div>

                {/* Billing Details */}
                <div className="flex justify-between mb-12 bg-slate-50 p-6 rounded-lg border border-slate-100 print:bg-transparent print:border-none print:p-0">
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bill To</p>
                        <p className="font-bold text-lg text-slate-800">{invoice.project.client.name}</p>
                        {invoice.project.client.email && (
                            <p className="text-sm text-slate-600">{invoice.project.client.email}</p>
                        )}
                    </div>
                    <div className="space-y-2 text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Project Details</p>
                        <p className="font-bold text-lg text-slate-800">{invoice.project.title}</p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="mt-4 flex-grow">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b-2 border-slate-800">
                                <th className="py-3 px-2 font-bold text-slate-800 uppercase tracking-wider">Description</th>
                                <th className="py-3 px-2 font-bold text-slate-800 uppercase tracking-wider text-center">Type</th>
                                <th className="py-3 px-2 font-bold text-slate-800 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="py-4 px-2">
                                    <p className="font-medium text-slate-800">Project Services</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {invoice.type === 'dp' ? 'Initial Down Payment (DP)' : 'Full Payment / Final Balance'}
                                    </p>
                                </td>
                                <td className="py-4 px-2 text-center">
                                    <Badge variant="outline" className="font-mono text-slate-600 bg-slate-50">
                                        {invoice.type.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </td>
                                <td className="py-4 px-2 text-right font-medium text-slate-800">
                                    {formatCurrency(invoice.amount.toString(), invoice.project.currency || "IDR")}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="flex justify-end mt-6">
                        <div className="w-1/2">
                            <div className="flex justify-between py-2 text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(invoice.amount.toString(), invoice.project.currency || "IDR")}</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                                <span>Tax (0%)</span>
                                <span>{formatCurrency(0, invoice.project.currency || "IDR")}</span>
                            </div>
                            <div className="flex justify-between py-4 text-xl font-bold text-slate-900 border-b-4 border-slate-800">
                                <span>Total Due</span>
                                <span>{formatCurrency(invoice.amount.toString(), invoice.project.currency || "IDR")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto pt-16">
                    {invoice.status !== 'paid' && (
                        <>
                            {invoice.project.currency === 'IDR' && (
                                <PayButton invoiceId={invoice.id} amountStr={formatCurrency(invoice.amount.toString(), "IDR")} />
                            )}
                            <div className="bg-slate-50 p-6 border-l-4 border-slate-800 print:border-l-2 print:border-slate-800">
                                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm mb-2">Manual Payment Instructions</h3>
                                <p className="text-xs text-slate-600 mb-4">
                                    Alternatively, transfer the total due amount to the following bank account. Reference the Invoice ID <span className="font-mono bg-white px-1 border rounded">#{invoice.id.split('-')[0].toUpperCase()}</span> in your transaction notes.
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 border rounded">
                                    <div>
                                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Bank Details</p>
                                        <p className="font-medium text-slate-800">Global Bank Inc.</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Account Holder</p>
                                        <p className="font-medium text-slate-800">ProjectBill Consulting</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t text-center">
                                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Account Number</p>
                                        <p className="font-mono text-xl font-bold tracking-widest text-slate-800">1234 5678 9012 3456</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="text-center mt-8 text-xs text-slate-400 border-t pt-4">
                        <p>Thank you for your business.</p>
                        <p>ProjectBill © {new Date().getFullYear()}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
