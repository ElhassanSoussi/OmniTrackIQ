import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

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
                <Card>
                    <CardHeader>
                        <CardTitle>Create Custom Metric</CardTitle>
                        <CardDescription>Compose a new metric formula.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="metric-name">Metric Name</Label>
                            <Input id="metric-name" placeholder="e.g. Blended ROAS" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="formula">Formula</Label>
                            <div className="flex gap-2">
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Metric" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="revenue">Total Revenue</SelectItem>
                                        <SelectItem value="spend">Ad Spend</SelectItem>
                                        <SelectItem value="orders">Orders</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center text-muted-foreground font-mono">/</div>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Metric" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="revenue">Total Revenue</SelectItem>
                                        <SelectItem value="spend">Ad Spend</SelectItem>
                                        <SelectItem value="orders">Orders</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button className="w-full">Save Metric</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle>Metric Library</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p>No custom metrics defined yet.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
