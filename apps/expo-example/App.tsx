import './global.css'
import React from 'react'
import { Text, View } from 'react-native'
import { ScopedTheme } from 'uniwind'

const App = () => {
    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-8 gap-8 max-w-xl">
            <Text className="text-2xl font-bold mb-4 text-gray-800">ScopedTheme Nesting</Text>

            {/* Root: Light */}
            <ScopedTheme theme="light">
                <View className="bg-background w-full p-6 rounded-2xl shadow-sm border border-black/5 gap-4">
                    <Text className="text-black font-medium text-center">Light Theme</Text>

                    {/* Nested: Dark */}
                    <ScopedTheme theme="dark">
                        <View className="bg-background p-6 rounded-xl gap-4">
                            <Text className="text-white font-medium text-center">Nested Dark Theme</Text>

                            {/* Nested: Premium */}
                            <ScopedTheme theme="premium">
                                <View className="bg-background p-6 rounded-lg shadow-sm">
                                    <Text className="text-black font-medium text-center">Nested Premium Theme</Text>
                                </View>
                            </ScopedTheme>
                        </View>
                    </ScopedTheme>
                </View>
            </ScopedTheme>

            {/* Parallel Root: Dark */}
            <ScopedTheme theme="dark">
                <View className="bg-background w-full p-6 rounded-2xl shadow-sm gap-4">
                    <Text className="text-white font-medium text-center">Dark Theme Root</Text>

                    {/* Nested: Light */}
                    <ScopedTheme theme="light">
                        <View className="bg-background p-4 rounded-xl light:opacity-50 dark:rotate-45">
                            <Text className="text-black font-medium text-center">Nested Light Theme</Text>
                        </View>
                    </ScopedTheme>
                </View>
            </ScopedTheme>
        </View>
    )
}

export default App
