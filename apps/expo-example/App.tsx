import './global.css'
import React from 'react'
import { Button, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Uniwind, useCSSVariable } from 'uniwind'

const TailwindTestPage = () => {
    const bg = useCSSVariable('--color-background')

    return (
        <View className="flex-1 justify-center items-center gap-4 bg-background">
            <Text className="text-3xl dark:text-white">
                Bg color: {bg}
            </Text>
            <Button
                title="Update --color-background to random value"
                onPress={() => {
                    Uniwind.updateCSSVariables(Uniwind.currentTheme, {
                        '--color-background': `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
                    })
                }}
            />
            <Button
                title="Dark"
                onPress={() => {
                    Uniwind.setTheme('dark')
                }}
            />
            <Button
                title="Light"
                onPress={() => {
                    Uniwind.setTheme('light')
                }}
            />
        </View>
    )
}

export default TailwindTestPage
