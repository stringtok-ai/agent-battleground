export type TokenResponse = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type UserMe = {
  id: number
  email: string
  display_name: string | null
  role: string
  balance_cents: number
}

export type ContestDto = {
  id: number
  pool_tier: string
  game: string
  entry_fee_cents: number
  prize_pool_cents: number
  max_slots: number
  join_deadline: string
  starts_at: string
  status: string
  filled_slots: number
}

export type AgentDto = {
  id: number
  name: string
  sku_tier: string
  elo: number
  mmr: number
  training_level: number
  latest_model_id: number | null
}

export type WalletBalance = {
  balance_cents: number
  currency: string
}

export type WalletTx = {
  id: number
  type: string
  amount_cents: number
  ref_type: string | null
  ref_id: number | null
  created_at: string
}
