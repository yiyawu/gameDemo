import { _decorator, Component, Sprite, SpriteFrame, UITransform, Animation, AnimationClip, animation } from 'cc'
import levels, { IEntity } from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
import EnemyManager from '../../Base/EnemyManager'
import DataManager from '../../Runtime/DataManager'
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine'

//动画帧数
const { ccclass, property } = _decorator
@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EnemyManager {
  async init(params: IEntity){
    this.fsm = this.addComponent(WoodenSkeletonStateMachine)
    await this.fsm.init()
    super.init(params)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this)
  }
  onDestroy(): void {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack)
  }

  onAttack() {
    if (this.state === ENTITY_STATE_ENUM.DEATH) {
      return
    }
    const { x: playerX, y: playerY, state: playerState } = DataManager.Instance.player
    if(
      (this.x === playerX && Math.abs(this.y - playerY) <= 1 ||
      this.y === playerY && Math.abs(this.x - playerX) <= 1) && playerState !== ENTITY_STATE_ENUM.DEATH
    ) {
      this.state = ENTITY_STATE_ENUM.ATTACK
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.DEATH)
    } else {
      this.state = ENTITY_STATE_ENUM.IDLE
    }
  }
}
