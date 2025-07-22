import { init, cleanup } from 'detox'
import config from '../detox.config'

beforeAll(async () => {
  await init(config)
})

afterAll(async () => {
  await cleanup()
})
