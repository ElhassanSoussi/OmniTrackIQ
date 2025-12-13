"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Calculator, Loader2 } from "lucide-react"
import { getCustomMetrics, deleteCustomMetric, type CustomMetric } from "@/lib/analytics-mgmt"
import { track } from "@/lib/analytics"

export default function CustomMetricsPage() {
    const [metrics, setMetrics] = useState<CustomMetric[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMetrics = async () => {
        try {
            setIsLoading(true)
            const data = await getCustomMetrics()
            setMetrics(data)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch custom metrics", err)
            setError("Failed to load custom metrics. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMetrics()
    }, [])

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Are you sure you want to delete this metric?")) return

        try {
            await deleteCustomMetric(id)
            setMetrics(prev => prev.filter(m => m.id !== id))
            track("custom_metric_deleted", { metric_id: id })
        } catch (err) {
            console.error("Failed to delete custom metric", err)
            alert("Failed to delete custom metric")
        }
    }

    const handleCreate = async () => {
        alert("Create Metric - Implementation pending UI dialog")
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
                <button onClick={fetchMetrics} className="mt-4 underline">Retry</button>
            </div>
        )
    }

    if (metrics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px] border-2 border-dashed rounded-lg bg-gray-50/50">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold">No Custom Metrics Yet</h2>
                    <p className="text-muted-foreground text-sm">
                        Define custom formulas to track the metrics that matter most to your business.
                    </p>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 mx-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Create Metric
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Custom Metrics</h1>
                    <p className="text-muted-foreground">Define and manage your custom calculated metrics.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Create Metric
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {metrics.map((metric) => (
                    <div
                        key={metric.id}
                        className="group relative flex flex-col justify-between p-6 bg-white border rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="space-y-2">
                            <div className="flex items-start justify-between">
                                <Calculator className="h-8 w-8 text-purple-500 mb-2" />
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                    {metric.format}
                                </span>
                            </div>
                            <h3 className="font-semibold truncate pr-8">{metric.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                {metric.description || "No description provided."}
                            </p>
                            <div className="pt-2">
                                <code className="text-xs bg-gray-50 px-2 py-1 rounded block truncate font-mono border">
                                    {metric.formula}
                                </code>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(metric.created_at).toLocaleDateString()}</span>
                            <button
                                onClick={(e) => handleDelete(metric.id, e)}
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
