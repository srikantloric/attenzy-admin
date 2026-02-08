import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ApiKeyRow from "@/components/ApiKeyRow"

function ApiKeysTab() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>API Keys</CardTitle>
        <Button size="sm">Generate Key</Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <ApiKeyRow
          name="Primary Key"
          keyValue="sk_live_xxxxxxxxx"
          status="Active"
        />

        <ApiKeyRow
          name="Staging Key"
          keyValue="sk_test_xxxxxxxxx"
          status="Active"
        />
      </CardContent>
    </Card>
  )
}

export default ApiKeysTab
