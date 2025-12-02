import { UniwindStore } from '../../core/native'

export const getVariableValue = (name: string) => UniwindStore.vars[name]
