import { render } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import InputAccessoryView from '../../../src/components/web/InputAccessoryView'

describe('InputAccessoryView', () => {
    test('applies className', () => {
        const { container } = render(
            <InputAccessoryView className="bg-red-500" />,
        )

        const view = container.firstElementChild

        expect(view).toHaveClass('bg-red-500')
    })
})
