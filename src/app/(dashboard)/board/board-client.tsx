"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ProjectDetailsDialog } from "./project-details-dialog"

type Client = { id: string, name: string }
type ProjectItem = { id: string, description: string, price: string }
type Project = {
    id: string
    title: string
    status: string
    totalPrice: string
    currency?: string
    client: Client
    items?: ProjectItem[]
    invoices?: any[]
    deadline?: string | null
}

const COLUMNS = [
    { id: "to_do", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
]

export function DashboardClient({ initialProjects }: { initialProjects: Project[] }) {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>(initialProjects)
    const [isGenerating, setIsGenerating] = useState<string | null>(null)
    const [selectedProjectForItems, setSelectedProjectForItems] = useState<string | null>(null)

    const formatCurrency = (amount: string | number, currencyStr: string) => {
        return new Intl.NumberFormat(currencyStr === "IDR" ? "id-ID" : "en-US", {
            style: "currency",
            currency: currencyStr,
            minimumFractionDigits: 0
        }).format(Number(amount))
    }

    const handleStatusChange = async (projectId: string, newStatus: string) => {
        // Optimistic update
        setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p))

        try {
            await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            // Revert on error
            setProjects(initialProjects)
        }
    }

    const handleGenerateInvoice = async (projectId: string) => {
        setIsGenerating(projectId)
        try {
            const res = await fetch(`/api/invoices/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId })
            })
            if (res.ok) {
                const data = await res.json()

                if (data.invoice) {
                    setProjects(prev => prev.map(p =>
                        p.id === projectId
                            ? { ...p, invoices: [...(p.invoices || []), data.invoice] }
                            : p
                    ))
                }

                if (data.emailSent) {
                    alert("Invoice generated and email dispatched to client")
                } else {
                    alert("Invoice generated successfully. (Email skipped or mocked)")
                }
                router.refresh()
            } else {
                console.error("Failed to generate invoice")
                alert("Failed to generate invoice")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsGenerating(null)
        }
    }

    const activeItemProject = projects.find(p => p.id === selectedProjectForItems)

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {COLUMNS.map(column => {
                    const columnProjects = projects.filter(p => p.status === column.id)

                    return (
                        <div key={column.id} className="bg-muted/50 p-4 rounded-xl flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-semibold text-sm uppercase tracking-wide">{column.title}</h3>
                                <Badge variant="secondary">{columnProjects.length}</Badge>
                            </div>

                            <div className="flex flex-col gap-3 min-h-[500px]">
                                {columnProjects.length === 0 ? (
                                    <div className="text-sm text-muted-foreground text-center py-8 italic">
                                        No projects here
                                    </div>
                                ) : (
                                    columnProjects.map(project => (
                                        <Card key={project.id} className="shadow-sm">
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base leading-tight">{project.title}</CardTitle>
                                                        <CardDescription className="text-xs pt-1">{project.client.name}</CardDescription>
                                                        {project.deadline && (
                                                            <div className="mt-2">
                                                                <Badge variant="outline" className="text-[10px] font-normal border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
                                                                    Due: {new Date(project.deadline).toLocaleDateString()}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 text-[10px] px-2"
                                                        onClick={() => setSelectedProjectForItems(project.id)}
                                                    >
                                                        Scope / Items
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 pb-3">
                                                <div className="text-sm font-medium">{formatCurrency(project.totalPrice, project.currency || "IDR")}</div>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                                                <Select
                                                    value={project.status}
                                                    onValueChange={(val) => handleStatusChange(project.id, val)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COLUMNS.map(col => (
                                                            <SelectItem key={col.id} value={col.id} className="text-xs">{col.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {project.status === "done" && (
                                                    <div className="w-full mt-2">
                                                        {project.invoices && project.invoices.find((i: any) => i.type === "full_payment") ? (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="w-full text-xs font-semibold bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => {
                                                                    const inv = project.invoices!.find((i: any) => i.type === "full_payment");
                                                                    if (inv?.paymentLink) {
                                                                        window.open(inv.paymentLink, "_blank");
                                                                    }
                                                                }}
                                                            >
                                                                {project.invoices.find((i: any) => i.type === "full_payment").status === "paid"
                                                                    ? "View Receipt"
                                                                    : "Pay Now Link"}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="w-full text-xs"
                                                                disabled={isGenerating === project.id}
                                                                onClick={() => handleGenerateInvoice(project.id)}
                                                            >
                                                                {isGenerating === project.id ? "Generating..." : "Generate Invoice"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {activeItemProject && (
                <ProjectDetailsDialog
                    projectId={activeItemProject.id}
                    projectTitle={activeItemProject.title}
                    currency={activeItemProject.currency || "IDR"}
                    items={activeItemProject.items || []}
                    isOpen={!!selectedProjectForItems}
                    onClose={() => setSelectedProjectForItems(null)}
                    onItemAdded={(item, newTotal) => {
                        setProjects(prev => prev.map(p =>
                            p.id === activeItemProject.id
                                ? { ...p, totalPrice: newTotal, items: [...(p.items || []), item] }
                                : p
                        ))
                    }}
                    onItemDeleted={(itemId, newTotal) => {
                        setProjects(prev => prev.map(p =>
                            p.id === activeItemProject.id
                                ? { ...p, totalPrice: newTotal, items: (p.items || []).filter(i => i.id !== itemId) }
                                : p
                        ))
                    }}
                />
            )}
        </div>
    )
}
