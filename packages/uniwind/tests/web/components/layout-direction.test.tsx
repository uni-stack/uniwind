import { render } from '@testing-library/react'
import * as React from 'react'
import { LayoutDirection } from '../../../src'

describe('LayoutDirection', () => {
    test('passes dir attribute on web', () => {
        const { getByText } = render(
            <LayoutDirection rtl>
                <span>RTL content</span>
            </LayoutDirection>,
        )

        expect(getByText('RTL content').parentElement).toHaveAttribute('dir', 'rtl')
    })

    test('passes ltr dir attribute on web', () => {
        const { getByText } = render(
            <LayoutDirection rtl={false}>
                <span>LTR content</span>
            </LayoutDirection>,
        )

        expect(getByText('LTR content').parentElement).toHaveAttribute('dir', 'ltr')
    })
})
