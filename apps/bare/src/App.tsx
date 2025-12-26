import './global.css'
import { Uniwind, useUniwind } from '@niibase/uniwind'
import { Button, Text, View } from 'react-native'

export function App() {
    const { theme } = useUniwind()

    console.log(theme)

    return (
        <View className="py-20 px-10 flex flex-row flex-wrap gap-10">
            <View className="ring-2 w-32 h-32">
                <Text>
                    ring-2
                </Text>
            </View>
            <View className="ring-red-500 ring-2 w-32 h-32">
                <Text>
                    ring-2 ring-red-500
                </Text>
            </View>
            <View className="shadow-2xl w-32 h-32">
                <Text>
                    shadow-2xl
                </Text>
            </View>
            <View className="shadow-2xl shadow-red-500 w-32 h-32">
                <Text>
                    shadow-2xl shadow-red-500
                </Text>
            </View>
            <Button
                title="Change theme"
                onPress={() => {
                    Uniwind.setTheme(theme === 'light' ? 'dark' : 'light')
                }}
            />
        </View>
    )
}
