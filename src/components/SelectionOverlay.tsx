import { useState } from 'react'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'

interface SelectionOverlayProps {
  overlayRef: React.RefObject<OverlayPanel | null>
  onApply: (count: number) => void
}

export default function SelectionOverlay({ overlayRef, onApply }: SelectionOverlayProps) {
  const [inputValue, setInputValue] = useState('')

  const handleApply = () => {
    const count = parseInt(inputValue)
    if (count && count > 0) {
      onApply(count)
      setInputValue('')
      overlayRef.current?.hide()
    }
  }

  const handleCancel = () => {
    setInputValue('')
    overlayRef.current?.hide()
  }

  return (
    <OverlayPanel ref={overlayRef}>
      <div style={{ padding: '12px', minWidth: '300px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
          Select Multiple Rows
        </h4>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="row-count" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: '500' }}>
            Enter number of rows to select across all pages
          </label>
          <InputText
            id="row-count"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., 20"
            style={{ width: '100%' }}
            type="number"
            min="1"
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            label="Apply"
            onClick={handleApply}
            style={{ flex: 1 }}
          />
          <Button
            label="Cancel"
            onClick={handleCancel}
            style={{ flex: 1 }}
            severity="secondary"
          />
        </div>
      </div>
    </OverlayPanel>
  )
}
