const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

export const generateDataSet = (props: Record<PropertyKey, any>) => {
    let dataSet = props.dataSet !== undefined
        ? { ...props.dataSet } as DataSet
        : undefined

    Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith('data-')) {
            dataSet ??= {}
            // Remove data- prefix
            dataSet[toCamelCase(key.slice(5))] = value
        }
    })

    return dataSet
}

type DataSet = Record<string, string | boolean | undefined>

declare module 'react-native' {
    interface SwitchProps {
        dataSet?: DataSet
    }

    interface TextProps {
        dataSet?: DataSet
    }

    interface TouchableWithoutFeedbackProps {
        dataSet?: DataSet
    }

    interface ViewProps {
        dataSet?: DataSet
    }

    interface PressableProps {
        dataSet?: DataSet
    }

    interface TextInputProps {
        dataSet?: DataSet
    }

    interface ImagePropsBase {
        dataSet?: DataSet
    }

    interface InputAccessoryViewProps {
        dataSet?: DataSet
    }

    interface ButtonProps {
        dataSet?: DataSet
    }
}
