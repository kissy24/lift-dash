import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import type { WorkoutPreset } from '@/lib/workouts/preset-defaults'

type PresetSelectorProps = {
  presets: WorkoutPreset[]
  selectedPresetId: string
  onSelect: (presetId: string) => void
}

export function PresetSelector({ presets, selectedPresetId, onSelect }: PresetSelectorProps) {
  return (
    <section className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
      <Label htmlFor="workout-preset">プリセット</Label>
      <Select
        id="workout-preset"
        value={selectedPresetId}
        disabled={presets.length === 0}
        onChange={(event) => onSelect(event.currentTarget.value)}
      >
        <option value="">プリセットを選択</option>
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </Select>
      {presets.length === 0 ? (
        <p className="text-sm text-muted-foreground">利用できるプリセットがありません</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          選択すると現在の種目とセットをプリセット内容で置き換えます。
        </p>
      )}
    </section>
  )
}
