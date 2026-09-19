/**
 * BlocklyWorkspace — visual block-based coding (audit T-P2-1).
 *
 * Renders a Google Blockly workspace (Apache-2.0) with a kid-friendly
 * toolbox and generates real Python from the blocks. The generated Python
 * flows through the exact SAME client-side Pyodide execution + backend
 * grading path as the text editor (see CodeMissionRunner / PyodideRunner) —
 * Blockly is purely an alternate authoring surface, so the trust boundary
 * (code runs in the browser, backend only grades output) is unchanged.
 *
 * This is the recommended on-ramp for younger learners (age 8-9) before they
 * move to typing Python directly.
 */
import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'
import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'
import 'blockly/blocks'
import * as En from 'blockly/msg/en'

export interface BlocklyWorkspaceHandle {
  /** Generate Python source from the current blocks. */
  getPython: () => string
}

export interface BlocklyWorkspaceProps {
  /** Optional initial workspace (Blockly XML). */
  initialXml?: string
  /** Called whenever the blocks change, with freshly generated Python. */
  onCodeChange?: (python: string) => void
}

// A deliberately small, age-appropriate toolbox: loops, logic, math, text,
// variables and simple output. Enough to express early CS-concept missions
// (sequencing, loops, conditionals) without overwhelming a young learner.
const TOOLBOX: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Logic',
      colour: '210',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      colour: '120',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_forEach' },
      ],
    },
    {
      kind: 'category',
      name: 'Math',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_random_int' },
      ],
    },
    {
      kind: 'category',
      name: 'Text',
      colour: '160',
      contents: [
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_print' },
        { kind: 'block', type: 'text_join' },
      ],
    },
    {
      kind: 'category',
      name: 'Variables',
      colour: '330',
      custom: 'VARIABLE',
    },
  ],
}

export const BlocklyWorkspace = forwardRef<BlocklyWorkspaceHandle, BlocklyWorkspaceProps>(
  function BlocklyWorkspace({ initialXml, onCodeChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

    useImperativeHandle(ref, () => ({
      getPython: () => {
        const ws = workspaceRef.current
        if (!ws) return ''
        return pythonGenerator.workspaceToCode(ws)
      },
    }))

    useEffect(() => {
      if (!containerRef.current) return

      // Blockly's locale must be set before injecting.
      Blockly.setLocale(En as unknown as Record<string, string>)

      const workspace = Blockly.inject(containerRef.current, {
        toolbox: TOOLBOX,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
        zoom: { controls: true, wheel: false, startScale: 1.0 },
        grid: { spacing: 20, length: 3, colour: '#eee', snap: true },
        renderer: 'zelos', // rounded, kid-friendly block shapes
      })
      workspaceRef.current = workspace

      if (initialXml) {
        try {
          const dom = Blockly.utils.xml.textToDom(initialXml)
          Blockly.Xml.domToWorkspace(dom, workspace)
        } catch {
          // A bad saved workspace should never crash the mission UI.
        }
      }

      const handleChange = () => {
        if (!onCodeChange) return
        const python = pythonGenerator.workspaceToCode(workspace)
        onCodeChange(python)
      }
      workspace.addChangeListener(handleChange)

      // Resize with the container so the canvas stays usable.
      const resize = () => Blockly.svgResize(workspace)
      const observer = new ResizeObserver(resize)
      observer.observe(containerRef.current)

      return () => {
        observer.disconnect()
        workspace.removeChangeListener(handleChange)
        workspace.dispose()
        workspaceRef.current = null
      }
      // Intentionally run once on mount; initialXml is an initial seed only.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <div
        ref={containerRef}
        aria-label="Visual block coding workspace"
        className="h-[420px] w-full rounded-lg border border-surface-200"
      />
    )
  },
)
