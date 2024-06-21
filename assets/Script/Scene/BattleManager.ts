import { _decorator, Component, Node } from 'cc'
const { ccclass, property } = _decorator
import { TileMapManager } from '../Tile/TileMapManager'
import { createUINode } from '../../Utils'
import levels, { ILevel } from '../../Levels'
import DataManager  from '../../Runtime/DataManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import EventManager from '../../Runtime/EventManager'
import { EVENT_ENUM } from '../../Enum'
import { PlayerManager } from '../Player/PlayerManager'
@ccclass('BattleManager')
export class BattleManager extends Component {
  level: ILevel
  stage: Node
  onLoad(): void {
    EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
  }
  onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
  }
  start() {
    this.generateStage()
    this.initLevel()
  }
  nextLevel() {
    DataManager.Instance.levelIndex++
    this.initLevel()
  }
  initLevel() {
    const level = levels[`level${DataManager.Instance.levelIndex}`]
    console.log(level);
    if (level) {
      this.clearLevel()
      this.level = level
      DataManager.Instance.mapInfo = this.level.mapInfo
      DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
      DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0
      this.generateTileMap()
      this.generatePlayer()
    }
  }
  clearLevel(){
    this.stage.destroyAllChildren()
    DataManager.Instance.reset()
  }
  generateStage() {
    this.stage = createUINode()
    this.stage.setParent(this.node)
  }
  generatePlayer(){
    const player = createUINode()
    player.setParent(this.stage)
    player.addComponent(PlayerManager).init()
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
    const { mapRowCount, mapColumnCount } = DataManager.Instance
    const disX = (TILE_WIDTH * mapRowCount) / 2
    const disY = (TILE_HEIGHT * mapColumnCount) / 2
    this.stage.setPosition(-disX, disY)
  }
}
