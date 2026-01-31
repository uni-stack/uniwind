const overwriteDisabled = `@custom-variant disabled {
    &:disabled {
        @slot;
    }

    &[aria-disabled="true"] {
        @slot;
    }

    &[readonly] {
        @slot;
    }
}
`

export const overwrite = overwriteDisabled
