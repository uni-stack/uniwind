import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from 'react-native'

function StorybookText() {
    return <Text className="text-3xl font-bold text-black">Uniwind Storybook</Text>
}

const meta = {
    component: StorybookText,
    title: 'Text',
} satisfies Meta<typeof StorybookText>

export default meta

export const Default: StoryObj<typeof meta> = {}
