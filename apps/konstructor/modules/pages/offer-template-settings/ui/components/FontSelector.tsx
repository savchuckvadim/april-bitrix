'use client'
import { Inter, Roboto, Open_Sans, Lato, Nunito } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
export const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-roboto' })
export const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' })
export const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' })
export const nunito = Nunito({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-nunito' })

const FONT_OPTIONS = [
  { label: 'Geist Sans', value: 'Geist, sans-serif' },
  { label: 'Geist Mono', value: 'GeistMono, monospace' },
  { label: 'Inter', value: '"Inter", sans-serif' },
  { label: 'Roboto', value: '"Roboto", sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: '"Lato", sans-serif' },

  { label: 'Arial', value: '"Arial", sans-serif' },
  { label: 'Helvetica', value: '"Helvetica", sans-serif' },
  { label: 'Verdana', value: '"Verdana", sans-serif' },
  { label: 'Tahoma', value: '"Tahoma", sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Georgia', value: '"Georgia", serif' },
  { label: 'Garamond', value: '"Garamond", serif' },

  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Impact', value: '"Impact", sans-serif' },

  { label: 'Ubuntu', value: '"Ubuntu", sans-serif' },
  { label: 'Lora', value: '"Lora", serif' },
  { label: 'Merriweather', value: '"Merriweather", serif' },
  { label: 'Montserrat', value: '"Montserrat", sans-serif' },

  

]

export function FontSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="mt-4">
      <label className="text-sm font-medium mb-1 block">Шрифт документа</label>
      <select
        className="border p-2 rounded w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {FONT_OPTIONS.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
    </div>
  )
}
