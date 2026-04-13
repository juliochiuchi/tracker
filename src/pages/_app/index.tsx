import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({
  component: Index,
})

function Index() {
  return <h1>hello world index app</h1>
}
