import { _decorator, Component, Sprite, SpriteFrame, UITransform, Animation, AnimationClip, animation } from 'cc'
import levels, { IEntity } from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
import EntityManager from '../../Base/EntityManager'
import DataManager from '../../Runtime/DataManager'
import { DoorStateMachine } from './DoorStateMachine'

//动画帧数
const { ccclass, property } = _decorator
@ccclass('DoorManager')
export class DoorManager extends EntityManager {
  async init(params: IEntity){
    this.fsm = this.addComponent(DoorStateMachine)
    await this.fsm.init()
    super.init(params)
    EventManager.Instance.on(EVENT_ENUM.DOOR_OPEN,this.onOpen, this)
  }
  onDestroy(): void {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.DOOR_OPEN,this.onOpen)
  }

  onOpen() {
    if(this.state !== ENTITY_STATE_ENUM.DEATH&&
      DataManager.Instance.enemies.every((enemy: EntityManager) => enemy.state == ENTITY_STATE_ENUM.DEATH)){
      this.state = ENTITY_STATE_ENUM.DEATH
    }
  }
}
