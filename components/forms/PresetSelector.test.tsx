import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PresetSelector } from './PresetSelector'

describe('PresetSelector', () => {
  it('renders presets and reports the selected id', () => {
    const onSelect = vi.fn()
    render(
      <PresetSelector
        presets={[{ id: 'preset-1', name: '胸の日', items: [] }]}
        selectedPresetId=""
        onSelect={onSelect}
      />
    )

    fireEvent.change(screen.getByLabelText('プリセット'), { target: { value: 'preset-1' } })
    expect(onSelect).toHaveBeenCalledWith('preset-1')
  })

  it('disables selection when no presets exist', () => {
    render(<PresetSelector presets={[]} selectedPresetId="" onSelect={vi.fn()} />)
    expect(screen.getByLabelText('プリセット')).toBeDisabled()
    expect(screen.getByText('利用できるプリセットがありません')).toBeInTheDocument()
  })
})
