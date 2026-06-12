import { Shape as ExpoShape, type ShapeProps } from '@expo/ui/jetpack-compose'
import { useAccentColor } from '../../native/useAccentColor'
import { copyComponentProperties } from '../../utils'

type ColorClassName = {
    colorClassName?: string
}

const Star = copyComponentProperties(ExpoShape.Star, (props: ShapeProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return <ExpoShape.Star {...props} color={props.color ?? color} />
})

const PillStar = copyComponentProperties(ExpoShape.PillStar, (props: ShapeProps) => {
    const color = useAccentColor(props.colorClassName, props)

    return <ExpoShape.PillStar {...props} color={props.color ?? color} />
})

const Pill = copyComponentProperties(
    ExpoShape.Pill,
    (props: Pick<ShapeProps, 'smoothing' | 'color' | 'modifiers'> & ColorClassName) => {
        const color = useAccentColor(props.colorClassName, props)

        return <ExpoShape.Pill {...props} color={props.color ?? color} />
    },
)

const Circle = copyComponentProperties(
    ExpoShape.Circle,
    (props: Pick<ShapeProps, 'radius' | 'verticesCount' | 'color' | 'modifiers'> & ColorClassName) => {
        const color = useAccentColor(props.colorClassName, props)

        return <ExpoShape.Circle {...props} color={props.color ?? color} />
    },
)

const Rectangle = copyComponentProperties(
    ExpoShape.Rectangle,
    (props: Pick<ShapeProps, 'smoothing' | 'cornerRounding' | 'color' | 'modifiers'> & ColorClassName) => {
        const color = useAccentColor(props.colorClassName, props)

        return <ExpoShape.Rectangle {...props} color={props.color ?? color} />
    },
)

const Polygon = copyComponentProperties(
    ExpoShape.Polygon,
    (props: Pick<ShapeProps, 'smoothing' | 'cornerRounding' | 'verticesCount' | 'color' | 'modifiers'> & ColorClassName) => {
        const color = useAccentColor(props.colorClassName, props)

        return <ExpoShape.Polygon {...props} color={props.color ?? color} />
    },
)

const RoundedCorner = copyComponentProperties(
    ExpoShape.RoundedCorner,
    (props: Pick<ShapeProps, 'cornerRadii' | 'color' | 'modifiers'> & ColorClassName) => {
        const color = useAccentColor(props.colorClassName, props)

        return <ExpoShape.RoundedCorner {...props} color={props.color ?? color} />
    },
)

export const Shape = {
    ...ExpoShape,
    Star,
    PillStar,
    Pill,
    Circle,
    Rectangle,
    Polygon,
    RoundedCorner,
}
