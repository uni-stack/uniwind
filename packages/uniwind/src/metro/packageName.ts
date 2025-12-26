import { basename, resolve } from 'node:path'
import { name } from '../../package.json'

const nodeModulesPath = resolve(__dirname, '../../../')
const packageName = basename(nodeModulesPath) === 'node_modules' ? basename(resolve(__dirname, '../../')) : name

export { nodeModulesPath, packageName }
