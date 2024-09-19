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
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager'
import { DoorManager } from '../Door/DoorManager'
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
  async initLevel() {
    const level = levels[`level${DataManager.Instance.levelIndex}`]
    if (level) {
      this.clearLevel()
      this.level = level
      DataManager.Instance.mapInfo = this.level.mapInfo
      DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
      DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0
      await this.generateTileMap()
      await this.generateEnemies()
      await this.generateDoor()
      await this.generatePlayer()
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
  async generatePlayer(){
    const player = createUINode()
    player.setParent(this.stage)
    const playerManager = player.addComponent(PlayerManager)
    await playerManager.init()
    DataManager.Instance.player = playerManager
    EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true)
  }
  async generateTileMap() {
    //地图节点，地图要放在场景上
    const tileMap = createUINode()
    tileMap.setParent(this.stage)
    const tileManage = tileMap.addComponent(TileMapManager)
    await tileManage.init()

    this.adaptPos()
  }
  async generateEnemies() {
    const enemies = createUINode()
    enemies.setParent(this.stage)
    const enemiesManager = enemies.addComponent(WoodenSkeletonManager)
    await enemiesManager.init()
    DataManager.Instance.enemies.push(enemiesManager)
  }
  async generateDoor() {
    const door = createUINode()
    door.setParent(this.stage)
    const doorManager = door.addComponent(DoorManager)
    await doorManager.init()
    DataManager.Instance.door = doorManager
  }
  adaptPos() {
    const { mapRowCount, mapColumnCount } = DataManager.Instance
    const disX = (TILE_WIDTH * mapRowCount) / 2
    const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80
    this.stage.setPosition(-disX, disY)
  }
}
