import { _decorator, Component, Sprite, SpriteFrame, UITransform, Animation, AnimationClip, animation } from 'cc'
import levels, { IEntity } from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
import EntityManager from '../../Base/EntityManager'
import DataManager from '../../Runtime/DataManager'
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine'

//动画帧数
const { ccclass, property } = _decorator
@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EntityManager {
  async init(){
    this.fsm = this.addComponent(WoodenSkeletonStateMachine)
    await this.fsm.init()
    super.init({
      x: 2,
      y: 6,
      type: ENTITY_TYPE_ENUM.PLAYER,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE
    })
    EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this)
  }
  onChangeDirection(isInit = false){
    const { x: playerX, y: playerY } = DataManager.Instance.player
    const disX = Math.abs(this.x - playerX)
    const disY = Math.abs(this.y - playerY)

    if(playerX >= this.x && playerY <= this.y){
      this.direction = disY> disX? DIRECTION_ENUM.TOP: DIRECTION_ENUM.RIGHT
    } else if (playerX <= this.x && playerY <= this.y) {
      this.direction = disY> disX? DIRECTION_ENUM.TOP: DIRECTION_ENUM.LEFT
    } else if (playerX <= this.x && playerY >= this.y) {
      this.direction = disY> disX? DIRECTION_ENUM.BOTTOM: DIRECTION_ENUM.LEFT
    } else if (playerX >= this.x && playerY >= this.y) {
      this.direction = disY> disX? DIRECTION_ENUM.BOTTOM: DIRECTION_ENUM.RIGHT
    }
  }
  onDestroy(): void {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack)
  }

  onAttack() {
    const { x: playerX, y: playerY } = DataManager.Instance.player
    if(
      this.x === playerX && Math.abs(this.y - playerY) <= 1 ||
      this.y === playerY && Math.abs(this.x - playerX) <= 1
    ) {
      this.state = ENTITY_STATE_ENUM.ATTACK
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.DEATH)
    } else {
      this.state = ENTITY_STATE_ENUM.IDLE
    }
  }
}
