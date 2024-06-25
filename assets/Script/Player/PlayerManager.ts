import { _decorator, Component, Sprite, SpriteFrame, UITransform, Animation, AnimationClip, animation } from 'cc'
import levels from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
import { PlayerStateMachine } from './PlayerStateMachine'

//动画帧数
const { ccclass, property } = _decorator
@ccclass('PlayerManager')
export class PlayerManager extends Component {
  x:number = 0
  y:number = 0
  targetX:number = 0
  targetY:number = 0
  fsm: PlayerStateMachine
  private _direction: DIRECTION_ENUM
  private _state: ENTITY_STATE_ENUM
  private readonly move_speed = 1/10
  
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
  async init(){
    const sprite = this.addComponent(Sprite)
    //代码方式更改属性
    sprite.sizeMode = Sprite.SizeMode.CUSTOM
    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH*4, TILE_HEIGHT*4)
    this.fsm = this.addComponent(PlayerStateMachine)
    await this.fsm.init()
    this.direction = DIRECTION_ENUM.TOP
    this.state = ENTITY_STATE_ENUM.IDLE
    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this)
  }

  update(dt: number): void {
      this.updateXY()
      this.node.setPosition(this.x * TILE_WIDTH, this.y * TILE_HEIGHT)
  }
  /**
   * 实现逻辑，设置目标坐标targetX.targetY
   * 让x,y坐标逐渐趋于目标坐标,当相差很小的时候在让他们相等
   */
  updateXY(){
    if(this.targetX < this.x){
      this.x -= this.move_speed
    }  else if (this.targetX > this.x) {
      this.x += this.move_speed
    }
    if(this.targetY < this.y){
      this.y -= this.move_speed
    } else if (this.targetY > this.y) {
      this.y += this.move_speed
    }
    if(Math.abs(this.targetY - this.y) < 0.01 && Math.abs(this.targetX - this.x) < 0.01){
      this.x = this.targetX
      this.y = this.targetY
    }
  }
  move(type: CONTROLLER_ENUM){
    if(type === CONTROLLER_ENUM.BOTTOM){
      this.targetY -= 1
    } else if (type === CONTROLLER_ENUM.TOP) {
      this.targetY += 1
    } else if (type === CONTROLLER_ENUM.LEFT) {
      this.targetX -= 1
    } else if (type === CONTROLLER_ENUM.RIGHT) {
      this.targetX += 1
    } else if (type === CONTROLLER_ENUM.TURNLEFT) {
      if(this.direction === DIRECTION_ENUM.TOP){
        this.direction = DIRECTION_ENUM.LEFT
      } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
        this.direction = DIRECTION_ENUM.RIGHT
      } else if (this.direction === DIRECTION_ENUM.LEFT) {
        this.direction = DIRECTION_ENUM.BOTTOM
      } else if (this.direction === DIRECTION_ENUM.RIGHT) {
        this.direction = DIRECTION_ENUM.TOP
      }
      this.state = ENTITY_STATE_ENUM.TURNLEFT
    }
  }
}
