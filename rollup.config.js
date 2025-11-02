import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export default {
    input: 'src/index.ts',
    output: [
        { file: 'dist/index.js', format: 'esm', sourcemap: false },
        { file: 'dist/index.cjs', format: 'cjs', sourcemap: false },
    ],
    plugins: [
        resolve(),
        commonjs(),
        typescript({ tsconfig: "./tsconfig.json" })
    ]
}