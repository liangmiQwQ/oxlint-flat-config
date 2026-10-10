import { liangmi } from '@liangmi/vp-config'

export default await liangmi({
  test: {
    typecheck: {
      enabled: true
    }
  },
  pack: {
    entry: './src/index.ts'
  }
})
