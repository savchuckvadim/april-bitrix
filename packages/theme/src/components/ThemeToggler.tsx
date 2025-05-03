'use client'
// import { ColorScheme, ColorSchemes } from '../provider/Theme';
import { useTheme } from 'next-themes';
// import { useColorScheme } from '../hook/useColorScheme';
// import { JSX, useState } from 'react'
// import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, MoonStar, Palette, Sparkles, SunDim } from 'lucide-react'
import { MoonStar, SunDim } from 'lucide-react'

import { ColorSchemePicker } from './ColorSchemePicker';

// const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
// const schemeIcons: Record<ColorScheme, JSX.Element> = {
//   default: <Dice1 className="w-5 h-5" />,
//   blue: <Dice2 className="w-5 h-5 text-blue-500" />,
//   violet: <Dice3 className="w-5 h-5 text-violet-500" />,
//   pink: <Dice4 className="w-5 h-5 text-pink-500" />,
//   red: <Dice5 className="w-5 h-5 text-red-500" />,
//   orange: <Dice6 className="w-5 h-5 text-orange-500" />,
//   yellow: <Palette className="w-5 h-5 text-yellow-500" />,
//   green: <Sparkles className="w-5 h-5 text-green-500" />,
// }

export const ThemeToggler = () => {
  const { theme, setTheme } = useTheme()
  // const { scheme, setScheme } = useColorScheme()
  // const [isSpinning, setIsSpinning] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // const rollColorScheme = () => {
  //   setIsSpinning(true)
  //   const delay = 1000
  //   const randomIndex = Math.floor(Math.random() * ColorSchemes.length)
  //   const newScheme = ColorSchemes[randomIndex]

  //   setTimeout(() => {
  //     setScheme(newScheme)
  //     setIsSpinning(false)
  //   }, delay)
  // }

  // Определим кубик по текущей цветовой схеме
  // const currentDice = (() => {
  //   const index = ColorSchemes.indexOf(scheme)
  //   const DiceIcon = diceIcons[index % diceIcons.length] || Dice1
  //   return <DiceIcon  className={`cursor-pointer w-3 h-3 ${isSpinning ? 'animate-spin' : ''}`} />
  // })()

  return (
    <div className="flex items-center gap-1 text-foreground">
      {/* Кнопка переключения темы */}
      <button onClick={toggleTheme} className="cursor-pointer transition-transform duration-300">
        {theme === 'dark' ? <MoonStar size={20} /> : <SunDim size={20} />}
      </button>

      {/* Кубик для смены схемы
      <button
        onClick={rollColorScheme}
        className={`transition-transform duration-500 ${isSpinning ? 'animate-spin' : ''}`}
      >
        {currentDice}
      </button> */}
      <ColorSchemePicker />
    </div>
  )
}
