"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CheckCircle, Clock } from "lucide-react"

interface ExperimentStats {
  name: string
  status: "running" | "completed" | "paused"
  variants: Array<{
    name: string
    sampleSize: number
    conversionRate: number
    revenue: number
    winner?: boolean
  }>
  startDate: string
  endDate: string
  expectedDuration: string
}

const mockExperiments: ExperimentStats[] = [
  {
    name: "AI Response Time Optimization",
    status: "running",
    variants: [
      { name: "Control (Current)", sampleSize: 245, conversionRate: 62, revenue: 15840 },
      { name: "Faster Response", sampleSize: 243, conversionRate: 71, revenue: 18123 },
      { name: "Personalized", sampleSize: 256, conversionRate: 68, revenue: 17408 },
    ],
    startDate: "2024-01-10",
    endDate: "2024-01-24",
    expectedDuration: "14 days",
  },
  {
    name: "Recommendation Type Testing",
    status: "running",
    variants: [
      { name: "Text Only", sampleSize: 189, conversionRate: 58, revenue: 11022 },
      { name: "With Metrics", sampleSize: 192, conversionRate: 72, revenue: 13824, winner: true },
      { name: "With Images", sampleSize: 188, conversionRate: 65, revenue: 12220 },
    ],
    startDate: "2024-01-08",
    endDate: "2024-01-22",
    expectedDuration: "14 days",
  },
  {
    name: "Voice Input UX Redesign",
    status: "completed",
    variants: [
      { name: "Current Design", sampleSize: 420, conversionRate: 64, revenue: 26880, winner: true },
      { name: "Simplified Design", sampleSize: 428, conversionRate: 62, revenue: 26536 },
    ],
    startDate: "2023-12-25",
    endDate: "2024-01-08",
    expectedDuration: "14 days",
  },
]

export function ABTestDashboard() {
  const [selectedExperiment, setSelectedExperiment] = useState(0)
  const experiment = mockExperiments[selectedExperiment]

  const chartData = experiment.variants.map((v) => ({
    name: v.name,
    conversion: v.conversionRate,
    revenue: v.revenue,
  }))

  const statusColors = {
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
  }

  return (
    <div className="space-y-6">
      {/* Experiment Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4">A/B Testing Experiments</h2>
        <div className="flex gap-2 overflow-x-auto pb-4">
          {mockExperiments.map((exp, idx) => (
            <Button
              key={idx}
              onClick={() => setSelectedExperiment(idx)}
              variant={selectedExperiment === idx ? "default" : "outline"}
              className="whitespace-nowrap"
            >
              {exp.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Experiment Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{experiment.name}</CardTitle>
              <CardDescription>
                Started: {experiment.startDate} | Duration: {experiment.expectedDuration}
              </CardDescription>
            </div>
            <Badge className={statusColors[experiment.status]}>
              {experiment.status === "running" && <Clock className="w-3 h-3 mr-1" />}
              {experiment.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
              {experiment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-4">Conversion Rates</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conversion" fill="#0072F5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Revenue Impact</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="revenue" fill="#00D084" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Variant Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Variant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Sample Size</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Conversion Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Revenue</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {experiment.variants.map((variant, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium">{variant.name}</td>
                    <td className="px-4 py-3">{variant.sampleSize}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${variant.conversionRate}%` }}
                          />
                        </div>
                        <span>{variant.conversionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{variant.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {variant.winner && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Insights */}
          {experiment.status === "completed" && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Experiment Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-800 mb-4">
                  The winning variant showed a{" "}
                  {Math.round((experiment.variants[0].conversionRate - experiment.variants[1].conversionRate) * 10) /
                    10}
                  % improvement in conversion rate and an additional ₹
                  {(experiment.variants[0].revenue - experiment.variants[1].revenue).toLocaleString()} in revenue.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">Implement Winner</Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
