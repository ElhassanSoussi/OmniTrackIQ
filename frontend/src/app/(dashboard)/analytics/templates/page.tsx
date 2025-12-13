export default function TemplatesPage() {
    return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px] border-2 border-dashed rounded-lg bg-gray-50/50">
            <div className="max-w-md text-center space-y-4">
                <h2 className="text-xl font-semibold">No Templates Yet</h2>
                <p className="text-muted-foreground text-sm">
                    Create reusable report templates to streamline your analytics workflow.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Create Template
                </button>
            </div>
        </div>
    )
}
