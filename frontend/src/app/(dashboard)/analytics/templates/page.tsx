"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, FileText, Loader2 } from "lucide-react"
import { getTemplates, deleteTemplate, type ReportTemplate } from "@/lib/analytics-mgmt"
import { track } from "@/lib/analytics"

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<ReportTemplate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTemplates = async () => {
        try {
            setIsLoading(true)
            const data = await getTemplates()
            setTemplates(data)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch templates", err)
            setError("Failed to load templates. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Are you sure you want to delete this template?")) return

        try {
            await deleteTemplate(id)
            setTemplates(prev => prev.filter(t => t.id !== id))
            track("report_template_deleted", { template_id: id })
        } catch (err) {
            console.error("Failed to delete template", err)
            alert("Failed to delete template")
        }
    }

    const handleCreate = async () => {
        // For now, just a placeholder or strict navigation
        // ideally opens a modal or navigates to /analytics/templates/new
        alert("Create Template - Implementation pending UI dialog")
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-red-50 text-red-600 rounded-lg">
                <p>{error}</p>
                <button onClick={fetchTemplates} className="mt-4 underline">Retry</button>
            </div>
        )
    }

    if (templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px] border-2 border-dashed rounded-lg bg-gray-50/50">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold">No Templates Yet</h2>
                    <p className="text-muted-foreground text-sm">
                        Create reusable report templates to streamline your analytics workflow.
                    </p>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 mx-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Create Template
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Report Templates</h1>
                    <p className="text-muted-foreground">Manage your reusable report configurations.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Create Template
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="group relative flex flex-col justify-between p-6 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="space-y-2">
                            <div className="flex items-start justify-between">
                                <FileText className="h-8 w-8 text-blue-500 mb-2" />
                            </div>
                            <h3 className="font-semibold truncate pr-8">{template.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                {template.description || "No description provided."}
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(template.created_at).toLocaleDateString()}</span>
                            <button
                                onClick={(e) => handleDelete(template.id, e)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
