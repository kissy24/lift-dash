export type ActionError = {
  message: string
  fields?: Record<string, string[]>
}

export type ActionFailure = { success: false; error: ActionError }

export type ActionResult<T = undefined> = { success: true; data: T } | ActionFailure
