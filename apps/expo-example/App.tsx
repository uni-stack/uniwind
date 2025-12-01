import './global.css'
import React from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

const TailwindTestPage = () => {
    return (
        <ScrollView className="flex-1 bg-gray-100 py-safe-or-10">
            {/* Layout & Flexbox */}
            <View className="p-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Layout & Flexbox</Text>

                <View className="flex flex-row justify-between items-center mb-4 bg-white p-4 rounded-lg">
                    <View className="w-16 h-16 bg-red-500 rounded"></View>
                    <View className="w-16 h-16 bg-blue-500 rounded"></View>
                    <View className="w-16 h-16 bg-green-500 rounded"></View>
                </View>

                <View className="flex flex-col items-center mb-4 bg-white p-4 rounded-lg">
                    <View className="w-full h-12 bg-purple-500 mb-2 rounded"></View>
                    <View className="w-3/4 h-12 bg-yellow-500 mb-2 rounded"></View>
                    <View className="w-1/2 h-12 bg-pink-500 rounded"></View>
                </View>

                <View className="flex flex-row flex-wrap justify-center bg-white p-4 rounded-lg mb-4">
                    <View className="w-20 h-20 bg-indigo-500 m-2 rounded"></View>
                    <View className="w-20 h-20 bg-teal-500 m-2 rounded"></View>
                    <View className="w-20 h-20 bg-orange-500 m-2 rounded"></View>
                    <View className="w-20 h-20 bg-cyan-500 m-2 rounded"></View>
                </View>
            </View>

            {/* Spacing */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Spacing</Text>

                <View className="bg-white rounded-lg mb-4">
                    <View className="p-1 bg-red-100">
                        <Text className="text-xs">p-1</Text>
                    </View>
                    <View className="p-2 bg-red-200">
                        <Text className="text-xs">p-2</Text>
                    </View>
                    <View className="p-4 bg-red-300">
                        <Text className="text-xs">p-4</Text>
                    </View>
                    <View className="p-8 bg-red-400">
                        <Text className="text-xs">p-8</Text>
                    </View>
                </View>

                <View className="bg-white rounded-lg mb-4">
                    <View className="m-1 bg-blue-100 p-2">
                        <Text className="text-xs">m-1</Text>
                    </View>
                    <View className="m-2 bg-blue-200 p-2">
                        <Text className="text-xs">m-2</Text>
                    </View>
                    <View className="m-4 bg-blue-300 p-2">
                        <Text className="text-xs">m-4</Text>
                    </View>
                </View>

                <View className="bg-white rounded-lg mb-4 p-4">
                    <View className="pt-4 pb-2 pl-6 pr-8 bg-green-200">
                        <Text className="text-xs">pt-4 pb-2 pl-6 pr-8</Text>
                    </View>
                </View>
            </View>

            {/* Sizing */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Sizing</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="w-full h-8 bg-purple-300 mb-2 rounded"></View>
                    <View className="w-3/4 h-8 bg-purple-400 mb-2 rounded"></View>
                    <View className="w-1/2 h-8 bg-purple-500 mb-2 rounded"></View>
                    <View className="w-1/4 h-8 bg-purple-600 mb-2 rounded"></View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="w-16 h-4 bg-yellow-300 mb-2 rounded"></View>
                    <View className="w-24 h-6 bg-yellow-400 mb-2 rounded"></View>
                    <View className="w-32 h-8 bg-yellow-500 mb-2 rounded"></View>
                    <View className="w-48 h-12 bg-yellow-600 rounded"></View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="min-w-0 min-h-0 max-w-xs max-h-24 bg-teal-300 p-4 rounded">
                        <Text className="text-xs">min-w-0 min-h-0 max-w-xs max-h-24</Text>
                    </View>
                </View>
            </View>

            {/* Typography */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Typography</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-xs mb-2">text-xs: The quick brown fox</Text>
                    <Text className="text-sm mb-2">text-sm: The quick brown fox</Text>
                    <Text className="text-base mb-2">text-base: The quick brown fox</Text>
                    <Text className="text-lg mb-2">text-lg: The quick brown fox</Text>
                    <Text className="text-xl mb-2">text-xl: The quick brown fox</Text>
                    <Text className="text-2xl mb-2">text-2xl: The quick brown fox</Text>
                    <Text className="text-3xl mb-2">text-3xl: The quick brown fox</Text>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="font-thin mb-2">font-thin: Thin weight</Text>
                    <Text className="font-light mb-2">font-light: Light weight</Text>
                    <Text className="font-normal mb-2">font-normal: Normal weight</Text>
                    <Text className="font-medium mb-2">font-medium: Medium weight</Text>
                    <Text className="font-semibold mb-2">font-semibold: Semibold weight</Text>
                    <Text className="font-bold mb-2">font-bold: Bold weight</Text>
                    <Text className="font-extrabold mb-2">font-extrabold: Extra bold weight</Text>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-left mb-2">text-left: Left aligned text</Text>
                    <Text className="text-center mb-2">text-center: Center aligned text</Text>
                    <Text className="text-right mb-2">text-right: Right aligned text</Text>
                    <Text className="text-justify mb-2">
                        text-justify: Justified text that should wrap to multiple lines to demonstrate the justify alignment behavior in React Native.
                    </Text>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="italic mb-2">italic: Italic text style</Text>
                    <Text className="not-italic mb-2">not-italic: Not italic text style</Text>
                    <Text className="underline mb-2">underline: Underlined text</Text>
                    <Text className="line-through mb-2">line-through: Line through text</Text>
                    <Text className="no-underline mb-2">no-underline: No underline text</Text>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="uppercase mb-2">uppercase: uppercase text</Text>
                    <Text className="lowercase mb-2">LOWERCASE: lowercase text</Text>
                    <Text className="capitalize mb-2">capitalize: capitalize text</Text>
                    <Text className="normal-case mb-2">normal-case: Normal case text</Text>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="leading-none mb-2">
                        leading-none: Line height none. This text should have tight line spacing when it wraps to multiple lines.
                    </Text>
                    <Text className="leading-tight mb-2">
                        leading-tight: Line height tight. This text should have tight line spacing when it wraps to multiple lines.
                    </Text>
                    <Text className="leading-normal mb-2">
                        leading-normal: Line height normal. This text should have normal line spacing when it wraps to multiple lines.
                    </Text>
                    <Text className="leading-relaxed mb-2">
                        leading-relaxed: Line height relaxed. This text should have relaxed line spacing when it wraps to multiple lines.
                    </Text>
                    <Text className="leading-loose mb-2">
                        leading-loose: Line height loose. This text should have loose line spacing when it wraps to multiple lines.
                    </Text>
                </View>
            </View>

            {/* Colors */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Colors</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-red-500 mb-1">text-red-500</Text>
                    <Text className="text-blue-500 mb-1">text-blue-500</Text>
                    <Text className="text-green-500 mb-1">text-green-500</Text>
                    <Text className="text-yellow-500 mb-1">text-yellow-500</Text>
                    <Text className="text-purple-500 mb-1">text-purple-500</Text>
                    <Text className="text-pink-500 mb-1">text-pink-500</Text>
                    <Text className="text-indigo-500 mb-1">text-indigo-500</Text>
                    <Text className="text-gray-500 mb-1">text-gray-500</Text>
                </View>

                <View className="flex flex-row flex-wrap bg-white p-4 rounded-lg mb-4">
                    <View className="w-12 h-12 bg-red-100 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-red-300 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-red-500 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-red-700 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-red-900 m-1 rounded"></View>
                </View>

                <View className="flex flex-row flex-wrap bg-white p-4 rounded-lg mb-4">
                    <View className="w-12 h-12 bg-blue-100 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-blue-300 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-blue-500 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-blue-700 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-blue-900 m-1 rounded"></View>
                </View>

                <View className="flex flex-row flex-wrap bg-white p-4 rounded-lg mb-4">
                    <View className="w-12 h-12 bg-green-100 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-green-300 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-green-500 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-green-700 m-1 rounded"></View>
                    <View className="w-12 h-12 bg-green-900 m-1 rounded"></View>
                </View>
            </View>

            {/* Borders */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Borders</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="border border-gray-300 p-4 mb-4 rounded">
                        <Text>border border-gray-300</Text>
                    </View>
                    <View className="border-2 border-red-500 p-4 mb-4 rounded">
                        <Text>border-2 border-red-500</Text>
                    </View>
                    <View className="border-4 border-blue-500 p-4 mb-4 rounded">
                        <Text>border-4 border-blue-500</Text>
                    </View>
                    <View className="border-8 border-green-500 p-4 mb-4 rounded">
                        <Text>border-8 border-green-500</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="border-t-4 border-red-500 p-4 mb-4">
                        <Text>border-t-4 border-red-500</Text>
                    </View>
                    <View className="border-r-4 border-blue-500 p-4 mb-4">
                        <Text>border-r-4 border-blue-500</Text>
                    </View>
                    <View className="border-b-4 border-green-500 p-4 mb-4">
                        <Text>border-b-4 border-green-500</Text>
                    </View>
                    <View className="border-l-4 border-yellow-500 p-4 mb-4">
                        <Text>border-l-4 border-yellow-500</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="border-2 border-gray-400 rounded-none p-4 mb-4">
                        <Text>rounded-none</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-sm p-4 mb-4">
                        <Text>rounded-sm</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded p-4 mb-4">
                        <Text>rounded</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-md p-4 mb-4">
                        <Text>rounded-md</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-lg p-4 mb-4">
                        <Text>rounded-lg</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-xl p-4 mb-4">
                        <Text>rounded-xl</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-2xl p-4 mb-4">
                        <Text>rounded-2xl</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-3xl p-4 mb-4">
                        <Text>rounded-3xl</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-full p-4 mb-4 w-24 h-24 items-center justify-center">
                        <Text className="text-center">rounded-full</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="border-2 border-gray-400 rounded-tl-lg p-4 mb-4">
                        <Text>rounded-tl-lg</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-tr-lg p-4 mb-4">
                        <Text>rounded-tr-lg</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-bl-lg p-4 mb-4">
                        <Text>rounded-bl-lg</Text>
                    </View>
                    <View className="border-2 border-gray-400 rounded-br-lg p-4 mb-4">
                        <Text>rounded-br-lg</Text>
                    </View>
                </View>
            </View>

            {/* Effects */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Effects</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="opacity-100 bg-blue-500 p-4 mb-4 rounded">
                        <Text className="text-white">opacity-100</Text>
                    </View>
                    <View className="opacity-75 bg-blue-500 p-4 mb-4 rounded">
                        <Text className="text-white">opacity-75</Text>
                    </View>
                    <View className="opacity-50 bg-blue-500 p-4 mb-4 rounded">
                        <Text className="text-white">opacity-50</Text>
                    </View>
                    <View className="opacity-25 bg-blue-500 p-4 mb-4 rounded">
                        <Text className="text-white">opacity-25</Text>
                    </View>
                    <View className="opacity-0 bg-blue-500 p-4 mb-4 rounded">
                        <Text className="text-white">opacity-0 (invisible)</Text>
                    </View>
                </View>
            </View>

            {/* Positioning */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Positioning</Text>

                <View className="bg-white p-4 rounded-lg mb-4 h-64 relative">
                    <View className="absolute top-0 left-0 w-16 h-16 bg-red-500 rounded">
                        <Text className="text-white text-xs p-1">top-0 left-0</Text>
                    </View>
                    <View className="absolute top-0 right-0 w-16 h-16 bg-blue-500 rounded">
                        <Text className="text-white text-xs p-1">top-0 right-0</Text>
                    </View>
                    <View className="absolute bottom-0 left-0 w-16 h-16 bg-green-500 rounded">
                        <Text className="text-white text-xs p-1">bottom-0 left-0</Text>
                    </View>
                    <View className="absolute bottom-0 right-0 w-16 h-16 bg-yellow-500 rounded">
                        <Text className="text-white text-xs p-1">bottom-0 right-0</Text>
                    </View>
                    <View className="absolute top-1/2 left-1/2 w-16 h-16 bg-purple-500 rounded -mt-8 -ml-8">
                        <Text className="text-white text-xs p-1">centered</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="relative z-10 bg-red-500 p-4 rounded mb-4">
                        <Text className="text-white">z-10 (higher)</Text>
                    </View>
                    <View className="relative z-0 bg-blue-500 p-4 rounded -mt-8 ml-4">
                        <Text className="text-white">z-0 (lower)</Text>
                    </View>
                </View>
            </View>

            {/* Interactive Elements */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Interactive Elements</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <TouchableOpacity className="bg-blue-500 p-4 rounded mb-4">
                        <Text className="text-white text-center font-semibold">TouchableOpacity Button</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-green-500 p-3 rounded-lg mb-4">
                        <Text className="text-white text-center">Green Button</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-red-500 p-2 rounded-full mb-4">
                        <Text className="text-white text-center text-sm">Rounded Button</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="border-2 border-purple-500 p-4 rounded mb-4">
                        <Text className="text-purple-500 text-center font-semibold">Outlined Button</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <TextInput
                        className="border border-gray-300 p-3 rounded mb-4"
                        placeholder="Default input"
                    />
                    <TextInput
                        className="border-2 border-blue-500 p-3 rounded-lg mb-4"
                        placeholder="Blue border input"
                    />
                    <TextInput
                        className="bg-gray-100 p-3 rounded mb-4"
                        placeholder="Gray background input"
                    />
                    <TextInput
                        className="border border-gray-300 p-3 rounded-full mb-4"
                        placeholder="Rounded input"
                    />
                </View>
            </View>

            {/* Transform */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Transform</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="transform rotate-12 bg-red-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">rotate-12</Text>
                    </View>
                    <View className="transform -rotate-12 bg-blue-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">-rotate-12</Text>
                    </View>
                    <View className="transform rotate-45 bg-green-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">rotate-45</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="transform scale-75 bg-purple-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">scale-75</Text>
                    </View>
                    <View className="transform scale-110 bg-yellow-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">scale-110</Text>
                    </View>
                    <View className="transform scale-125 bg-pink-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">scale-125</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="transform translate-x-4 bg-indigo-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">translate-x-4</Text>
                    </View>
                    <View className="transform translate-y-4 bg-teal-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">translate-y-4</Text>
                    </View>
                    <View className="transform translate-x-4 translate-y-4 bg-orange-500 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">translate-x-4 translate-y-4</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="transform translate-10 rotate-12 scale-125 bg-sky-900 p-4 rounded mb-4 w-32">
                        <Text className="text-white text-center">translate-10 rotate-12 scale-125</Text>
                    </View>
                </View>
            </View>

            {/* Images */}
            <View className="px-4 mb-8">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Images</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="w-full h-48 bg-gray-300 rounded mb-4 items-center justify-center">
                        <Text className="text-gray-600">w-full h-48 (Image placeholder)</Text>
                    </View>
                    <View className="w-32 h-32 bg-gray-300 rounded-full mb-4 items-center justify-center">
                        <Text className="text-gray-600 text-center text-xs">w-32 h-32 rounded-full</Text>
                    </View>
                    <View className="w-24 h-24 bg-gray-300 rounded-lg mb-4 items-center justify-center">
                        <Text className="text-gray-600 text-center text-xs">w-24 h-24 rounded-lg</Text>
                    </View>
                </View>
            </View>

            {/* Overflow */}
            <View className="px-4 mb-8">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Overflow</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="overflow-hidden w-48 h-16 bg-gray-200 rounded mb-4">
                        <Text>
                            overflow-hidden: This is a very long text that should be clipped by the container because it exceeds the width and height
                            limits.
                        </Text>
                    </View>
                    <View className="overflow-visible w-48 h-16 bg-gray-200 rounded mb-4">
                        <Text>overflow-visible: This text might overflow the container boundaries.</Text>
                    </View>
                </View>
            </View>

            {/* Shadows */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Shadows</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <View className="shadow-sm bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-sm</Text>
                    </View>
                    <View className="shadow bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow (default)</Text>
                    </View>
                    <View className="shadow-md bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-md</Text>
                    </View>
                    <View className="shadow-lg bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-lg</Text>
                    </View>
                    <View className="shadow-xl bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-xl</Text>
                    </View>
                    <View className="shadow-2xl bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-2xl</Text>
                    </View>
                    <View className="shadow-none bg-gray-200 p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-none</Text>
                    </View>
                </View>

                {/* Colored Shadows */}
                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Colored Shadows</Text>
                    <View className="shadow-lg shadow-red-500/50 bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-lg shadow-red-500/50</Text>
                    </View>
                    <View className="shadow-lg shadow-blue-500/50 bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-lg shadow-blue-500/50</Text>
                    </View>
                    <View className="shadow-lg shadow-green-500/50 bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-lg shadow-green-500/50</Text>
                    </View>
                    <View className="shadow-lg shadow-purple-500/50 bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-lg shadow-purple-500/50</Text>
                    </View>
                    <View className="shadow-xl shadow-black/25 bg-white p-4 rounded mb-4 mx-2">
                        <Text className="text-center">shadow-xl shadow-black/25</Text>
                    </View>
                </View>

                {/* Shadow with different elements */}
                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Shadows on Different Elements</Text>

                    <TouchableOpacity className="shadow-lg bg-blue-500 p-4 rounded mb-4">
                        <Text className="text-white text-center font-semibold">Button with shadow-lg</Text>
                    </TouchableOpacity>

                    <View className="shadow-xl bg-white border border-gray-200 p-4 rounded-lg mb-4">
                        <Text className="text-gray-800">Card with shadow-xl and border</Text>
                        <Text className="text-gray-600 text-sm mt-2">This looks like a material design card</Text>
                    </View>
                </View>
            </View>

            {/* Ring System */}
            <View className="px-4">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Ring System</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Ring Widths</Text>
                    <View className="ring-1 ring-gray-300 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-1 ring-gray-300</Text>
                    </View>
                    <View className="ring-2 ring-gray-400 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-2 ring-gray-400</Text>
                    </View>
                    <View className="ring-4 ring-gray-500 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-4 ring-gray-500</Text>
                    </View>
                    <View className="ring-8 ring-gray-600 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-8 ring-gray-600</Text>
                    </View>
                    <View className="ring ring-gray-500 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring (default) ring-gray-500</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Ring Colors</Text>
                    <View className="ring-4 ring-red-500 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-4 ring-red-500</Text>
                    </View>
                    <View className="ring-4 ring-blue-500 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-4 ring-blue-500</Text>
                    </View>
                    <View className="ring-4 ring-green-500 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-4 ring-green-500</Text>
                    </View>
                    <View className="ring-4 ring-yellow-500 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-4 ring-yellow-500</Text>
                    </View>
                    <View className="ring-4 ring-purple-500 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-4 ring-purple-500</Text>
                    </View>
                    <View className="ring-4 ring-pink-500 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-4 ring-pink-500</Text>
                    </View>
                </View>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Ring Offset</Text>
                    <View className="ring-4 ring-blue-500 ring-offset-1 ring-offset-white bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-offset-1 ring-offset-white</Text>
                    </View>
                    <View className="ring-4 ring-blue-500 ring-offset-2 ring-offset-white bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-offset-2 ring-offset-white</Text>
                    </View>
                    <View className="ring-4 ring-blue-500 ring-offset-4 ring-offset-white bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-offset-4 ring-offset-white</Text>
                    </View>
                    <View className="ring-4 ring-blue-500 ring-offset-8 ring-offset-white bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-offset-8 ring-offset-white</Text>
                    </View>
                </View>

                <View className="bg-gray-100 p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Ring Offset Colors</Text>
                    <View className="ring-4 ring-blue-500 ring-offset-4 ring-offset-gray-100 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-offset-gray-100</Text>
                    </View>
                    <View className="ring-4 ring-green-500 ring-offset-4 ring-offset-red-200 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-offset-red-200</Text>
                    </View>
                    <View className="ring-4 ring-purple-500 ring-offset-4 ring-offset-yellow-200 bg-white p-4 rounded mb-4">
                        <Text className="text-center">ring-offset-yellow-200</Text>
                    </View>
                </View>

                {/* Ring on Interactive Elements */}
                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Ring on Interactive Elements</Text>

                    <TouchableOpacity className="ring-2 ring-blue-500 ring-offset-2 ring-offset-white bg-blue-500 p-4 rounded mb-4">
                        <Text className="text-white text-center font-semibold">Button with Ring</Text>
                    </TouchableOpacity>

                    <TextInput
                        className="ring-2 ring-purple-500 ring-offset-1 ring-offset-white border-0 p-3 rounded mb-4"
                        placeholder="Input with ring focus state"
                    />

                    <TouchableOpacity className="ring-4 ring-green-500 ring-opacity-50 bg-white border-2 border-green-500 p-4 rounded-lg mb-4">
                        <Text className="text-green-500 text-center font-semibold">Outlined Button with Ring</Text>
                    </TouchableOpacity>

                    <View className="ring-2 ring-indigo-500 ring-offset-2 ring-offset-white bg-indigo-50 p-4 rounded-lg mb-4">
                        <Text className="text-indigo-800 font-medium">Card with Ring Border</Text>
                        <Text className="text-indigo-600 text-sm mt-1">This creates a nice focus or selection state</Text>
                    </View>
                </View>

                {/* Ring Inset */}
                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Ring Inset</Text>
                    <View className="ring-4 ring-inset ring-blue-500 bg-blue-100 p-4 rounded mb-4">
                        <Text className="text-center text-blue-800">ring-inset ring-blue-500</Text>
                    </View>
                    <View className="ring-4 ring-inset ring-red-500 bg-red-100 p-4 rounded mb-4">
                        <Text className="text-center text-red-800">ring-inset ring-red-500</Text>
                    </View>
                    <View className="ring-8 ring-inset ring-green-500 bg-green-100 p-4 rounded mb-4">
                        <Text className="text-center text-green-800">ring-8 ring-inset ring-green-500</Text>
                    </View>
                </View>
            </View>

            {/* Gradients */}
            <View className="px-4 mb-8">
                <Text className="text-2xl font-bold mb-4 text-gray-800">Gradients</Text>

                <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Linear to bottom</Text>
                    <View className="bg-gradient-to-b from-indigo-500 to-pink-500 rounded h-16 mb-4" />
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Linear to right 3 colors</Text>
                    <View className="bg-gradient-to-r from-indigo-500 via-sky-500 to-pink-500 rounded h-16 mb-4" />
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Linear to bottom left</Text>
                    <View className="bg-gradient-to-bl from-orange-200 to-red-900 rounded h-32 mb-4" />
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Linear 150 deg</Text>
                    <View className="bg-linear-150 from-orange-500 to-indigo-600 rounded h-32 mb-4" />
                    <Text className="text-lg font-semibold mb-4 text-gray-700">Linear custom multiple colors</Text>
                    <View className="bg-linear-[25deg,red_5%,yellow_60%,lime_90%,teal] rounded h-32 mb-4" />
                </View>
            </View>
        </ScrollView>
    )
}

export default TailwindTestPage
