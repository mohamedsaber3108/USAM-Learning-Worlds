/**
 * SandpackMission — a locked-down @codesandbox/sandpack-react wrapper for
 * JS/React coding missions. Runs entirely in the browser's in-page bundler
 * (no backend execution). Locked down so learners can't navigate the
 * preview iframe to an arbitrary URL or make outbound network calls from
 * inside the sandboxed bundle.
 */
import { useCallback, useRef } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpackClient,
} from '@codesandbox/sandpack-react'

export interface SandpackRunResult {
  stdout: string
  stderr: string
  result: unknown
}

interface SandpackMissionProps {
  starterCode: string
  onResult?: (result: SandpackRunResult) => void
}

/** Locked-down template: a single file, no router, no external fetch UI. */
const lockedFiles = (starterCode: string) => ({
  '/App.js': {
    code: starterCode,
    active: true,
  },
})

function ConsoleBridge({ onResult }: { onResult?: ((r: SandpackRunResult) => void) | undefined }) {
  const { listen } = useSandpackClient()
  const logsRef = useRef<string[]>([])

  const handle = useCallback(
    (msg: any) => {
      if (msg?.type === 'console' && Array.isArray(msg.log)) {
        for (const entry of msg.log) {
          logsRef.current.push(entry?.data?.join?.(' ') ?? String(entry))
        }
        if (onResult) {
          onResult({
            stdout: logsRef.current.join('\n'),
            stderr: '',
            result: undefined,
          })
        }
      }
    },
    [onResult],
  )

  listen(handle)
  return null
}

export function SandpackMission({ starterCode, onResult }: SandpackMissionProps) {
  return (
    <SandpackProvider
      template="vanilla"
      files={lockedFiles(starterCode)}
      options={{
        // No arbitrary iframe navigation, no external resources.
        externalResources: [],
        recompileMode: 'delayed',
        recompileDelay: 300,
      }}
      customSetup={{
        entry: '/App.js',
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor showTabs={false} showLineNumbers />
        <SandpackPreview
          showNavigator={false}
          showOpenInCodeSandbox={false}
          showRefreshButton
        />
      </SandpackLayout>
      <SandpackConsole />
      <ConsoleBridge onResult={onResult} />
    </SandpackProvider>
  )
}
