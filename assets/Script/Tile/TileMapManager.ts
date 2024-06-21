import { _decorator, Component, Layers, Node, randomRange, randomRangeInt, resources, Sprite, SpriteFrame, UITransform } from 'cc'
import levels from '../../Levels'
import { createUINode,renderRange } from '../../Utils'
import { TileManager } from './TileManage'
import DataManager from '../../Runtime/DataManager'
import ResourceManager from '../../Runtime/ResourceManager'

const { ccclass, property } = _decorator
@ccclass('TileMapManager')
export class TileMapManager extends Component {
  async init() {
    const { mapInfo } = DataManager.Instance
    const spriteFrames = await ResourceManager.Instance.loadDir('texture/tile/tile')
    mapInfo.map((i, mIndex) => {
      i.map((mapItem, mtIndex) => {
        if (mapItem.src === null || mapItem.type === null) {
          return
        }
        const node = createUINode()
        let number = mapItem.src
        if (number === 1 && mIndex % 2 === 0 && mtIndex % 2 === 1) {
          number += randomRangeInt (0, 4)
        } else if (number === 5 && mIndex % 2 === 0 && mtIndex % 2 === 1) {
          number += randomRangeInt (0, 4)
        } else if (number === 9 && mIndex % 2 === 0 && mtIndex % 2 === 1) {
          number += randomRangeInt (0, 4)
        }
        const imgSrc = `tile (${number})`
        const spriteFrame = spriteFrames.filter(v => v.name === imgSrc)[0]
        const tileManage = node.addComponent(TileManager)
        tileManage.init(spriteFrame, mIndex, mtIndex)
        node.setParent(this.node)
      })
    })
    // console.log(level, 'd')
  }

}
