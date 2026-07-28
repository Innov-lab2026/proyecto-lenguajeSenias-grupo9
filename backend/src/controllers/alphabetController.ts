import { Request, Response } from 'express'
import { completeAlphabetLetterService, getAlphabetProgressService } from '../services/alphabetService'

// Abecedario dactilológico LSA — mismo conjunto que la grilla del frontend
// (LSA_ALPHABET en app/(protected)/alphabet.tsx). CH, LL y RR son letras
// propias, con seña distinta a la de sus letras sueltas.
const LSA_ALPHABET = [
  'A', 'B', 'C', 'CH', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'LL', 'M',
  'N', 'Ñ', 'O', 'P', 'Q', 'R', 'RR', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
]

// NFC: la Ñ puede llegar descompuesta (N + tilde combinante) según de dónde
// venga el string, y así no matchearía nunca contra la lista de arriba.
function normalizeLetter(value: string): string {
  return value.normalize('NFC').toUpperCase()
}

export const getAlphabetProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = await getAlphabetProgressService(userId)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const completeAlphabetLetter = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const letter = normalizeLetter(req.params.letter as string)

    if (!LSA_ALPHABET.includes(letter)) {
      return res.status(400).json({ message: 'La letra no pertenece al abecedario LSA' })
    }

    const result = await completeAlphabetLetterService(userId, letter)
    return res.json({ data: result })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
