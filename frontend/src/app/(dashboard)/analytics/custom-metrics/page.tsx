export default function CustomMetricsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Custom Metrics</h1>
                    <p className="text-muted-foreground">Define your own metrics based on existing data points.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Create Custom Metric</h2>
                    <p className="text-sm text-gray-500 mb-4">Compose a new metric formula.</p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="metric-name" className="text-sm font-medium">Metric Name</label>
                            <input
                                id="metric-name"
                                placeholder="e.g. Blended ROAS"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="pt-4">
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Metric</button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border rounded-lg bg-gray-50">
                    <h2 className="text-lg font-semibold mb-2">Metric Library</h2>
                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                        <p>No custom metrics defined yet.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
