import './global.css'
import React from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ScopedTheme } from 'uniwind'

const TailwindTestPage = () => {
    return (
        <View className="flex-1 bg-violet-800 justify-center items-center">
            <ScopedTheme theme="light">
                <View className="size-20 bg-background" />
            </ScopedTheme>
            <ScopedTheme theme="dark">
                <View className="size-20 bg-background" />
            </ScopedTheme>
            <ScopedTheme theme="premium">
                <View className="size-20 bg-background dark:opacity-50" />
            </ScopedTheme>
        </View>
    )
}

export default TailwindTestPage
