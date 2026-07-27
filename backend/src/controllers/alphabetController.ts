import { Request, Response } from 'express'
import { completeAlphabetLetterService, getAlphabetProgressService } from '../services/alphabetService'

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
    const letter = req.params.letter as string

    if (letter.length !== 1) {
      return res.status(400).json({ message: 'La letra debe ser un único carácter' })
    }

    const result = await completeAlphabetLetterService(userId, letter)
    return res.json({ data: result })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
