export type ActionError = {
  message: string
  fields?: Record<string, string[]>
}

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: ActionError }
