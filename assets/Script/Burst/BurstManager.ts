import { UITransform, _decorator } from 'cc'
import { IEntity } from '../../Levels'
import { BurstStateMachine } from './BurstStateMachine'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import EntityManager from 'db://assets/Base/EntityManager'
import EventManager from '../../Runtime/EventManager'
import { ENTITY_STATE_ENUM, EVENT_ENUM, SHAKE_TYPE_ENUM } from '../../Enum'
import DataManager from '../../Runtime/DataManager'
const { ccclass } = _decorator

@ccclass('BurstManager')
export class BurstManager extends EntityManager {
  async init(params: IEntity) {
    this.fsm = this.addComponent(BurstStateMachine)
    await this.fsm.init()
    super.init(params)
    this.transform = this.getComponent(UITransform)
    this.transform.setContentSize(TILE_HEIGHT, TILE_WIDTH)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst, this)
  }

  onDestroy(): void {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst)
  }

  update(): void {
    this.onDestroy.setPosition(this.x*TILE_WIDTH, -this.y * TILE_HEIGHT)
  }

  onBurst(): void {
    if(this.state === ENTITY_STATE_ENUM.DEATH){
      return
    }
    const { targetX: playerX, targetY: playerY } = DataManager.Instance.player
    if(this.x === playerX && this.y === playerY && this.state === ENTITY_STATE_ENUM.IDLE) {
      this.state = ENTITY_STATE_ENUM.ATTACK
    } else if(this.state === ENTITY_STATE_ENUM.ATTACK) {
      this.state = ENTITY_STATE_ENUM.DEATH
      EventManager.Instance.emit(EVENT_ENUM.SCREEN_SHAKE, SHAKE_TYPE_ENUM.BOTTOM)
      if(this.x === playerX && this.y === playerY) {
        EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.AIRDEATH)
      }
    }
  }
}
