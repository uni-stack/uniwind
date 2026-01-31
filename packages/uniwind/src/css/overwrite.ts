const overwriteDisabled = `@custom-variant disabled {
    &:disabled {
        @slot;
    }

    &[aria-disabled="true"] {
        @slot;
    }
}
`

export const overwrite = overwriteDisabled
