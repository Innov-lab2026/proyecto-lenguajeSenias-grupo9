import { useState } from 'react'
import { Exercises } from './DataDemo'

type Exercise = {
    img: string
    value1: string
    value2: string
    value3: string
    correctValue: string
}

export default function InteractiveDemo() {
    const exercises = Object.values(Exercises) as Exercise[]
    const [index, setIndex] = useState(0)
    const exercise = exercises[index]
    const [selected, setSelected] = useState<string | null>(null)
    const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle')

    const options = [exercise.value1, exercise.value2, exercise.value3]

    function handleOptionChange(value: string) {
        if (status === 'correct') return
        setSelected(value)
    }

    function handleButton() {
        if (status === 'idle') {
            if (!selected) return
            if (selected === exercise.correctValue) {
                setStatus('correct')
            } else {
                setStatus('wrong')
            }
            return
        }

        if (status === 'wrong') {
            // allow retry
            setStatus('idle')
            setSelected(null)
            return
        }

        if (status === 'correct') {
            // advance or finish
            if (index < exercises.length - 1) {
                setIndex(i => i + 1)
                setSelected(null)
                setStatus('idle')
            } else {
                // last exercise: "Continua en la App" - no action for now
            }
        }
    }

    const buttonText =
        status === 'idle' ? 'Chequear respuesta' : status === 'wrong' ? 'Reintentar' : index === 0 ? 'Siguiente' : 'Continua en la App'

    const buttonClass =
        status === 'wrong'
            ? 'col-span-3 row-span-1 cursor-pointer bg-red-600 text-white py-2 px-4 rounded-md border-2 border-white'
            : status === 'correct' && index === 0
                ? 'col-span-3 row-span-1 cursor-pointer bg-green-600 text-white py-2 px-4 rounded-md border-2 border-white'
                : status === 'correct' && index === 1
                    ? 'col-span-3 row-span-1 cursor-pointer bg-success text-foreground font-bold py-2 px-4 rounded-full border-2 border-success-border hover:bg-success-hover'
                    : 'col-span-3 row-span-1 cursor-pointer bg-primary text-white py-2 px-4 rounded-md border-2 border-white hover:bg-accent'

    return (
        <div
            className="bg-accent/80  text-white 
                        flex flex-col items-center justify-center gap-4 
                        p-8 rounded-4xl 
                        border-2 border-[#F5FBFF]/40">

            <div className="bg-white rounded-4xl p-4">
                <img src={exercise.img} alt="Demo" className="w-48 h-auto rounded-2xl" loading="lazy" />
            </div>

            <fieldset className="grid grid-cols-3 grid-rows-2 gap-8 py-8 w-full">

                <legend className="grid col-span-3 row-span-1 text-center">
                    ¿Qué letra representa esta seña?
                </legend>

                {options.map(option => {
                    const isSelected = selected === option
                    const isWrongSelected = isSelected && status === 'wrong' && selected !== exercise.correctValue
                    const isCorrectSelected = isSelected && status === 'correct'
                    const base = `h-14 w-14 cursor-pointer items-center justify-center rounded-md border-2 grid 
                                col-span-1 row-span-1 hover:bg-accent focus-within:ring-2 flex`
                    const stateClass = isWrongSelected ? 'text-red-700 border-red-700 bg-red-50' : isCorrectSelected ? 
                                        'text-green-700 border-green-700 bg-green-50' : ''
                    return (
                        <label key={option} className={`${base} ${stateClass}`}>
                            <input
                                type="radio"
                                name={`answer-${index}`}
                                value={option}
                                className="sr-only"
                                checked={isSelected}
                                onChange={() => handleOptionChange(option)}
                            />
                            <span className='font-bold'>{option}</span>
                        </label>
                    )
                })}

                <button className={buttonClass} onClick={handleButton}>
                    {buttonText}
                </button>

            </fieldset>

        </div>
    )
}