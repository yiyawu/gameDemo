import { _decorator, Component, Node } from 'cc'
const { ccclass, property } = _decorator
import { TileMapManager } from '../Tile/TileMapManager'
import { createUINode } from '../../Utils'
import levels, { ILevel } from '../../Levels'
import DataManager, { IRecord }  from '../../Runtime/DataManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import EventManager from '../../Runtime/EventManager'
import { ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { PlayerManager } from '../Player/PlayerManager'
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager'
import { DoorManager } from '../Door/DoorManager'
import { IronSkeletonManager } from '../IronSkeleton/IronSkeletonManager'
@ccclass('BattleManager')
export class BattleManager extends Component {
  level: ILevel
  stage: Node
  onLoad(): void {
    DataManager.Instance.levelIndex = 1
    EventManager.Instance.on(EVENT_ENUM.RESTART_LEVEL, this.initLevel, this)
    EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived, this)
    EventManager.Instance.on(EVENT_ENUM.RECORD_STEP, this.record, this)
    EventManager.Instance.on(EVENT_ENUM.REVOKE_STEP, this.revoke, this)
  }
  onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.RESTART_LEVEL, this.initLevel)
    EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived)
    EventManager.Instance.off(EVENT_ENUM.RECORD_STEP, this.record)
    EventManager.Instance.off(EVENT_ENUM.REVOKE_STEP, this.revoke)
    EventManager.Instance.clear()
  }
  start() {
    this.generateStage()
    this.initLevel()
  }
  nextLevel() {
    DataManager.Instance.levelIndex++
    this.initLevel()
  }
  /** 检查玩家是否到达终点位置 */
  checkArrived() {
    const { x:doorX,y:doorY,state:doorState } = DataManager.Instance.door
    const { x:playerX,y:playerY } = DataManager.Instance.player
    if( doorX === playerX && doorY === playerY && doorState === ENTITY_STATE_ENUM.DEATH) {
      EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL)
    }
  }
  async initLevel() {
    const level = levels[`level${DataManager.Instance.levelIndex}`]
    if (level) {
      this.clearLevel()
      this.level = level
      DataManager.Instance.mapInfo = this.level.mapInfo
      DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
      DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0
      await Promise.all([
        this.generateTileMap(),
        this.generateEnemies(),
        this.generateDoor(),
      ])
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
    await playerManager.init(this.level.player)
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
    // 初始化
    DataManager.Instance.enemies = []
    const promise = []
    for(let i = 0; i < this.level.enemies.length; i++) {
      const enemy = this.level.enemies[i]
      const node = createUINode()
      node.setParent(this.stage)
      const Manager = enemy.type === ENTITY_TYPE_ENUM.SKELETON_WOODEN? WoodenSkeletonManager: IronSkeletonManager
      const manager = node.addComponent(Manager)
      promise.push(manager.init(enemy))
      DataManager.Instance.enemies.push(manager)
    }
    await Promise.all(promise)
  }
  async generateDoor() {
    const door = createUINode()
    door.setParent(this.stage)
    const doorManager = door.addComponent(DoorManager)
    await doorManager.init(this.level.door)
    DataManager.Instance.door = doorManager
  }
  adaptPos() {
    const { mapRowCount, mapColumnCount } = DataManager.Instance
    const disX = (TILE_WIDTH * mapRowCount) / 2
    const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80
    this.stage.setPosition(-disX, disY)
  }
  record() {
    const item: IRecord = {
      player: {
        x: DataManager.Instance.player.targetX,
        y: DataManager.Instance.player.targetY,
        state:
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.IDLE ||
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.DEATH ||
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.AIRDEATH
            ? DataManager.Instance.player.state
            : ENTITY_STATE_ENUM.IDLE,
        direction: DataManager.Instance.player.direction,
        type: DataManager.Instance.player.type,
      },
      door: {
        x: DataManager.Instance.door.x,
        y: DataManager.Instance.door.y,
        state: DataManager.Instance.door.state,
        direction: DataManager.Instance.door.direction,
        type: DataManager.Instance.door.type,
      },
      enemies: DataManager.Instance.enemies.map(({ x, y, state, direction, type }) => {
        return {
          x,
          y,
          state,
          direction,
          type,
        }
      }),
    }

    DataManager.Instance.records.push(item)
  }

  revoke() {
    const data = DataManager.Instance.records.pop()
    if (data) {
      DataManager.Instance.player.x = DataManager.Instance.player.targetX = data.player.x
      DataManager.Instance.player.y = DataManager.Instance.player.targetY = data.player.y
      DataManager.Instance.player.state = data.player.state
      DataManager.Instance.player.direction = data.player.direction

      for (let i = 0; i < data.enemies.length; i++) {
        const item = data.enemies[i]
        DataManager.Instance.enemies[i].x = item.x
        DataManager.Instance.enemies[i].y = item.y
        DataManager.Instance.enemies[i].state = item.state
        DataManager.Instance.enemies[i].direction = item.direction
      }
      DataManager.Instance.door.x = data.door.x
      DataManager.Instance.door.y = data.door.y
      DataManager.Instance.door.state = data.door.state
      DataManager.Instance.door.direction = data.door.direction
    } else {
      //TODO 播放游戏音频嘟嘟嘟
    }
  }
}
