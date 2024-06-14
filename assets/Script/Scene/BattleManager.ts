import { _decorator, Component, Node } from 'cc'
const { ccclass, property } = _decorator
import { TileMapManager } from '../Tile/TileMapManager'
import { createUINode } from '../../Utils'
import levels, { ILevel } from '../../Level'
import { DataManagerInstance } from '../../Runtime/DataManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
@ccclass('BattleManager')
export class BattleManager extends Component {
  level: ILevel
  stage: Node
  start() {
    this.generateStage()
    this.initLevel()
  }
  initLevel() {
    const level = levels[`level${1}`]
    if (level) {
      this.level = level

      DataManagerInstance.mapInfo = this.level.mapInfo
      DataManagerInstance.mapRowCount = this.level.mapInfo.length || 0
      DataManagerInstance.mapColumnCount = this.level.mapInfo[0].length || 0

      this.generateTileMap()
    }
  }
  generateStage() {
    this.stage = createUINode()
    this.stage.setParent(this.node)
  }
  generateTileMap() {
    //地图节点，地图要放在场景上
    const tileMap = createUINode()
    tileMap.setParent(this.stage)
    const tileManage = tileMap.addComponent(TileMapManager)
    tileManage.init()

    this.adaptPos()
  }
  adaptPos() {
    const { mapRowCount, mapColumnCount } = DataManagerInstance
    const disX = (TILE_WIDTH * mapRowCount) / 2
    const disY = (TILE_HEIGHT * mapColumnCount) / 2
    this.stage.setPosition(-disX, disY)
  }
}
