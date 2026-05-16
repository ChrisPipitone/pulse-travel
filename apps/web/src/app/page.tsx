import { Badge } from '@pulse/ui'
import { Button } from '@pulse/ui'
import { Card } from '@pulse/ui'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-text-primary">Pulse</h1>
        <p className="mt-2 text-text-muted">Group vacation planner</p>
      </div>

      <Card className="w-full max-w-sm flex flex-col gap-4">
        <p className="text-sm text-text-muted">Rating badges</p>
        <div className="flex gap-2">
          <Badge rating="MUST" />
          <Badge rating="WANT" />
          <Badge rating="MEH" />
        </div>
        <p className="text-sm text-text-muted">Buttons</p>
        <div className="flex gap-2 flex-wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>
    </main>
  )
}
