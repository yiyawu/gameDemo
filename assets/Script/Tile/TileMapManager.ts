import { _decorator, Component, Layers, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc'
import levels from '../../Level'
import { createUINode } from '../../Utils'
import { TileManager } from './TileManage'
import { DataManagerInstance } from '../../Runtime/DataManager'

const { ccclass, property } = _decorator
@ccclass('TileMapManager')
export class TileMapManager extends Component {
  async init() {
    const { mapInfo } = DataManagerInstance
    const spriteFrames = await this.loadFile()
    console.log(mapInfo)
    mapInfo.map((i, mIndex) => {
      i.map((mapItem, mtIndex) => {
        if (mapItem.src === null || mapItem.type === null) {
          return
        }
        const node = createUINode()
        const imgSrc = `tile (${mapItem.src})`
        const spriteFrame = spriteFrames.filter(v => v.name === imgSrc)[0]
        const tileManage = node.addComponent(TileManager)
        tileManage.init(spriteFrame, mIndex, mtIndex)
        node.setParent(this.node)
      })
    })
    // console.log(level, 'd')
  }

  loadFile() {
    return new Promise<SpriteFrame[]>((resolve, reject) => {
      resources.loadDir('texture/tile/tile', SpriteFrame, (err, res) => {
        if (err) {
          reject(err)
          return
        }
        resolve(res)
      })
    })
  }
}
