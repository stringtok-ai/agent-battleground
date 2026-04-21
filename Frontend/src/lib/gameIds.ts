/** Match frontend game ids (e.g. push-block) with backend contest `game` (e.g. pushblock). */
export function normalizeGameId(id: string) {
  return id.toLowerCase().replace(/-/g, '')
}
