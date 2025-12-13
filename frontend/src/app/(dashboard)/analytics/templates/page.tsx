import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function TemplatesPage() {
    return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px] border-2 border-dashed rounded-lg bg-gray-50/50">
            <div className="max-w-md text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">No Templates Yet</h2>
                <p className="text-muted-foreground text-sm">
                    Create reusable report templates to streamline your analytics workflow.
                </p>
                <Button onClick={() => { }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            </div>
        </div>
    )
}
