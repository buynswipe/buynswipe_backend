import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DeliveryProofFormProps {
  orderId: string
  isCod: boolean
}

export function DeliveryProofForm({ orderId, isCod }: DeliveryProofFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Proof</CardTitle>
        <CardDescription>Delivery proof is not yet implemented</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Delivery proof is not yet implemented</p>
      </CardContent>
    </Card>
  )
}
