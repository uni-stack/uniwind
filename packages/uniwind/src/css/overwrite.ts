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

export const OVERWRITE_CSS = overwriteDisabled
