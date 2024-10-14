import { Component, Sprite, UITransform, _decorator } from 'cc'
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, PARAMS_NAME_ENUM } from '../Enum'
import { IEntity } from '../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Script/Tile/TileManage'
import { randomByLength } from '../Utils'
import StateMachine from './StateMachine'
const { ccclass, property } = _decorator
/**
 * 需要
 * type，当前实体类型
 * direction，当前实体方向
 * x，x坐标
 * y，y坐标
 * state，当前实体状态
 */
@ccclass('EntityManager')
export default class EntityManager extends Component {
  x:number
  y:number
  id: string = randomByLength(12)
  fsm: StateMachine
  private _direction: DIRECTION_ENUM
  private _state: ENTITY_STATE_ENUM
  private transform: UITransform

  type: ENTITY_TYPE_ENUM
  get direction(){
    return this._direction
  }
  set direction(newDirection){
    this._direction = newDirection
    this.fsm.setParams(PARAMS_NAME_ENUM.DIRECTION, DIRECTION_ORDER_ENUM[this._direction])
  }
  get state(){
    return this._state
  }
  set state(newState){
    this._state = newState
    this.fsm.setParams(this._state, true)
  }
  async init(params: IEntity){
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM
    this.transform = this.getComponent(UITransform)
    this.transform.setContentSize(TILE_WIDTH*4, TILE_HEIGHT*4)
    this.x = params.x
    this.y = params.y
    this.direction = params.direction
    this.state = params.state
  }
  
  onDestroy() {}

  update(): void {
      this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
  }
}
