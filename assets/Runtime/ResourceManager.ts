import { SpriteFrame, resources } from 'cc'
import Singleton from '../Base/Singleton'

export default class ResourceManager extends Singleton {
  static get Instance() {
    return super.getInstance<ResourceManager>()
  }

  loadDir(path: string, type:typeof SpriteFrame = SpriteFrame) {
    return new Promise<SpriteFrame[]>((resolve, reject) => {
      resources.loadDir(path, type, (err, res) => {
        if (err) {
          reject(err)
          return
        }
        resolve(res)
      })
    })
  }
}

