"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Power, Pencil, Trash2, CalendarClock } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";

interface Client {
    id: string;
    name: string;
    email: string | null;
}

interface Project {
    id: string;
    title: string;
    client: Client;
    currency: string;
}

interface RecurringInvoice {
    id: string;
    projectId: string;
    title: string;
    amount: string;
    frequency: "monthly" | "weekly" | "yearly";
    dayOfMonth: number;
    startDate: string;
    endDate: string | null;
    nextRunAt: string;
    isActive: boolean;
    description: string | null;
    project: Project;
}

export function RecurringInvoicesClient({
    initialRecurringInvoices,
    projects,
}: {
    initialRecurringInvoices: RecurringInvoice[];
    projects: Project[];
}) {
    const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>(initialRecurringInvoices);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [id, setId] = useState<string | null>(null);
    const [projectId, setProjectId] = useState("");
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [frequency, setFrequency] = useState<"monthly" | "weekly" | "yearly">("monthly");
    const [dayOfMonth, setDayOfMonth] = useState<number>(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);

    const formatCurrency = (amount: string | number, currencyStr: string) => {
        return new Intl.NumberFormat(currencyStr === "IDR" ? "id-ID" : "en-US", {
            style: "currency",
            currency: currencyStr,
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const resetForm = () => {
        setId(null);
        setProjectId("");
        setTitle("");
        setAmount("");
        setFrequency("monthly");
        setDayOfMonth(1);
        setStartDate(format(new Date(), "yyyy-MM-dd"));
        setEndDate("");
        setDescription("");
        setIsActive(true);
    };

    const handleOpenDialog = (ri?: RecurringInvoice) => {
        if (ri) {
            setId(ri.id);
            setProjectId(ri.projectId);
            setTitle(ri.title);
            setAmount(ri.amount);
            setFrequency(ri.frequency);
            setDayOfMonth(ri.dayOfMonth);
            setStartDate(format(new Date(ri.startDate), "yyyy-MM-dd"));
            setEndDate(ri.endDate ? format(new Date(ri.endDate), "yyyy-MM-dd") : "");
            setDescription(ri.description || "");
            setIsActive(ri.isActive);
        } else {
            resetForm();
        }
        setOpen(true);
    };

    const handleToggleActive = async (ri: RecurringInvoice) => {
        try {
            const response = await fetch(`/api/recurring-invoices/${ri.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: ri.projectId,
                    title: ri.title,
                    amount: ri.amount,
                    frequency: ri.frequency,
                    dayOfMonth: ri.dayOfMonth,
                    startDate: ri.startDate,
                    endDate: ri.endDate,
                    description: ri.description,
                    isActive: !ri.isActive,
                }),
            });

            if (!response.ok) throw new Error("Failed to toggle status");

            setRecurringInvoices(recurringInvoices.map((item) =>
                item.id === ri.id ? { ...item, isActive: !ri.isActive } : item
            ));

            toast.success("Status Updated", {
                description: `Recurring invoice has been ${ri.isActive ? "paused" : "activated"}.`,
            });
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "Failed to update status",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                projectId,
                title,
                amount: Number(amount),
                frequency,
                dayOfMonth: Number(dayOfMonth),
                startDate: new Date(startDate).toISOString(),
                endDate: endDate ? new Date(endDate).toISOString() : null,
                description,
                isActive,
            };

            if (id) {
                const res = await fetch(`/api/recurring-invoices/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Failed to update");

                toast.success("Success", { description: "Recurring invoice updated." });
            } else {
                const res = await fetch("/api/recurring-invoices", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Failed to create");

                toast.success("Success", { description: "Recurring invoice created." });
            }

            // Reload window to simplify state management for now since we rely on server component heavily
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "An error occurred.",
            });
            setLoading(false);
        }
    };

    const handleDelete = async (deleteIdToProcess: string) => {
        try {
            const response = await fetch(`/api/recurring-invoices/${deleteIdToProcess}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete");

            setRecurringInvoices(recurringInvoices.filter((r) => r.id !== deleteIdToProcess));
            toast.success("Deleted", { description: "Recurring invoice has been deleted." });
        } catch (error) {
            console.error(error);
            toast.error("Error", { description: "Failed to delete" });
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Recurring Invoices</CardTitle>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Recurring Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {id ? "Edit Recurring Invoice" : "Create Recurring Invoice"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label>Project</Label>
                                        <Select
                                            value={projectId}
                                            onValueChange={setProjectId}
                                            required
                                            disabled={!!id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.title} ({p.client.name})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="title">Schedule Name (e.g. Monthly Maintenance)</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Amount</Label>
                                        <NumericFormat
                                            value={amount}
                                            onValueChange={(values) => setAmount(values.value)}
                                            allowLeadingZeros={false}
                                            allowNegative={false}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="Rp "
                                            customInput={Input}
                                            required
                                            placeholder="e.g. 5.000.000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Frequency</Label>
                                        <Select
                                            value={frequency}
                                            onValueChange={(val: any) => setFrequency(val)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="yearly">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {frequency === "monthly" && (
                                        <div className="space-y-2">
                                            <Label>Day of Month (1-28)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="28"
                                                value={dayOfMonth}
                                                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>End Date (Optional)</Label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2 flex items-center justify-between border rounded-lg p-3">
                                        <div className="space-y-0.5">
                                            <Label>Active Status</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Turn off to pause schedule generation.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={setIsActive}
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label>Line Item Description (will appear on invoice)</Label>
                                        <Input
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {recurringInvoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg mt-4">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <CalendarClock className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No recurring invoices found</h3>
                            <p className="text-muted-foreground mb-4 max-w-sm">
                                Create a scheduled template to automatically send monthly or weekly invoices to your clients.
                            </p>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Recurring
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project / Client</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Next Run</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recurringInvoices.map((ri) => (
                                    <TableRow key={ri.id} className={!ri.isActive ? "opacity-60" : ""}>
                                        <TableCell>
                                            <div className="font-medium">{ri.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {ri.project.client.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="capitalize font-medium">{ri.frequency}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {ri.frequency === "monthly" && `Day ${ri.dayOfMonth}`}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(ri.amount, ri.project.currency)}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(ri.nextRunAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={ri.isActive ? "default" : "secondary"}>
                                                {ri.isActive ? "Active" : "Paused"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleActive(ri)}
                                                    title={ri.isActive ? "Pause schedule" : "Activate schedule"}
                                                >
                                                    <Power className={`h-4 w-4 ${ri.isActive ? "text-emerald-500" : "text-muted-foreground"}`} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(ri)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteId(ri.id)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <ConfirmDialog
                        open={!!deleteId}
                        onOpenChange={(open) => !open && setDeleteId(null)}
                        title="Delete Schedule"
                        description="Are you sure you want to stop and delete this recurring invoice schedule? This action cannot be undone."
                        onConfirm={async () => {
                            if (deleteId) {
                                await handleDelete(deleteId);
                                setDeleteId(null);
                            }
                        }}
                    />
                </CardContent>
            </Card>
        </>
    );
}
