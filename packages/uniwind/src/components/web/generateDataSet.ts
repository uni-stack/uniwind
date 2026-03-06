export const generateDataSet = (props: Record<PropertyKey, any>) => {
    const dataSet: DataSet = props.dataSet !== undefined ? { ...props.dataSet } : {}

    Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith('data-')) {
            // Remove data- prefix
            dataSet[key.slice(5)] = value
        }
    })

    return dataSet
}

type DataSet = Record<string, string | boolean>

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
