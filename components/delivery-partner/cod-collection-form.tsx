import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CodCollectionFormProps {
  orderId: string
  amount: number
}

export function CodCollectionForm({ orderId, amount }: CodCollectionFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>COD Collection</CardTitle>
        <CardDescription>COD Collection is not yet implemented</CardDescription>
      </CardHeader>
      <CardContent>
        <p>COD Collection is not yet implemented</p>
      </CardContent>
    </Card>
  )
}
