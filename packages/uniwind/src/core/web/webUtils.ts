export const toWebValue = (value: string | number) => typeof value === 'number' ? `${value}px` : value
