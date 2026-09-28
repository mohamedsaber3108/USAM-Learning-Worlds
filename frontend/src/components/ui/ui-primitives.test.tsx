import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import {
  Dialog, DialogTrigger, DialogContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Field, Progress,
} from './index'

/**
 * Phase B design-system primitives — behavior + accessibility gate.
 * These are the Radix-backed owned components every rebuilt surface sits on,
 * so they must be correct: dialog opens/closes, tabs switch, Field wires ARIA,
 * and no detectable axe violations.
 */
describe('UI primitives (Phase B)', () => {
  it('Dialog opens on trigger and shows its title', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent title="Hello" description="A dialog">
          <p>Body content</p>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.queryByText('Body content')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Open'))
    await waitFor(() => expect(screen.getByText('Body content')).toBeInTheDocument())
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('Tabs marks the clicked trigger as selected (ARIA)', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    )
    const tabA = screen.getByRole('tab', { name: 'Tab A' })
    const tabB = screen.getByRole('tab', { name: 'Tab B' })
    expect(tabA).toHaveAttribute('aria-selected', 'true')
    expect(tabB).toHaveAttribute('aria-selected', 'false')
    // Activating via keyboard is the robust cross-env path for Radix tabs.
    tabB.focus()
    fireEvent.keyDown(tabB, { key: 'Enter' })
    fireEvent.click(tabB)
    expect(tabB).toHaveAttribute('aria-selected', 'true')
  })

  it('Field associates label, sets aria-invalid + describedby on error', () => {
    render(<Field label="Email" error="Required" defaultValue="" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('Progress exposes the correct ARIA value', () => {
    render(<Progress value={42} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '42')
  })

  it('a composed form of primitives has no detectable a11y violations', async () => {
    const { container } = render(
      <div>
        <Field label="Name" help="Your first name" />
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">One</TabsTrigger>
            <TabsTrigger value="b">Two</TabsTrigger>
          </TabsList>
          <TabsContent value="a">First</TabsContent>
          <TabsContent value="b">Second</TabsContent>
        </Tabs>
        <Progress value={60} />
      </div>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  }, 30000)
})
