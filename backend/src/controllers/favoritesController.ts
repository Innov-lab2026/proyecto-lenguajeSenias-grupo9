import { Request, Response } from 'express'
import {
  addFavoriteService,
  getFavoritesService,
  removeFavoriteService,
  type FavorableType,
} from '../services/favoritesService'

const VALID_TYPES: FavorableType[] = ['video', 'letter']

function isValidType(value: unknown): value is FavorableType {
  return typeof value === 'string' && (VALID_TYPES as string[]).includes(value)
}

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = await getFavoritesService(userId)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { favorable_type, favorable_id } = req.body

    if (!isValidType(favorable_type) || typeof favorable_id !== 'string' || !favorable_id) {
      return res.status(400).json({ message: 'favorable_type ("video"|"letter") y favorable_id son requeridos' })
    }

    const data = await addFavoriteService(userId, favorable_type, favorable_id)
    res.status(201).json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const favorableType = req.params.type as string
    const favorableId = req.params.id as string

    if (!isValidType(favorableType)) {
      return res.status(400).json({ message: 'favorable_type inválido' })
    }

    await removeFavoriteService(userId, favorableType, favorableId)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
