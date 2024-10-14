import { _decorator, Component, Sprite, SpriteFrame, UITransform, Animation, AnimationClip, animation, input } from 'cc'
import levels, { IEntity } from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
import { PlayerStateMachine } from './PlayerStateMachine'
import EntityManager from '../../Base/EntityManager'
import DataManager from '../../Runtime/DataManager'

//动画帧数
const { ccclass, property } = _decorator
@ccclass('PlayerManager')
export class PlayerManager extends EntityManager {
  targetX:number
  targetY:number
  isMoving = false
  private readonly move_speed = 1/10

  async init(params: IEntity){
    console.log(params,'d')
    this.fsm = this.addComponent(PlayerStateMachine)
    await this.fsm.init()
    super.init(params)
    this.targetX = this.x
    this.targetY = this.y

    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.inputProcess, this)
    EventManager.Instance.on(EVENT_ENUM.ATTACK_PLAYER, this.onDead, this)
  }
  onDestroy() {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.PLAYER_CTRL, this.inputProcess)
    EventManager.Instance.off(EVENT_ENUM.ATTACK_PLAYER, this.onDead)
  }
  onDead(type: ENTITY_STATE_ENUM) {
    this.state = type
  }
  update(): void {
    this.updateXY()
    super.update()
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
    if(Math.abs(this.targetY - this.y) < 0.01 && Math.abs(this.targetX - this.x) < 0.01 && this.isMoving){
      this.x = this.targetX
      this.y = this.targetY
      this.isMoving = false
      EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END)
    }
  }
  inputProcess(inputDirection: CONTROLLER_ENUM) {
    if (this.isMoving) {
      return
    }
    if(
      this.state === ENTITY_STATE_ENUM.DEATH || 
      this.state === ENTITY_STATE_ENUM.AIRDEATH || 
      this.state === ENTITY_STATE_ENUM.ATTACK
    ) {
      console.log(1,this.state);
      return 
    }
    const id = this.willAttack(inputDirection)
    if(id){
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_ENEMY, id)
      return
    }
    if(this.willBlock(inputDirection)){
      console.log('block');
      return
    }
    this.move(inputDirection)
  }
  move(type: CONTROLLER_ENUM){
    if(type === CONTROLLER_ENUM.TOP){
      this.targetY -= 1
      this.isMoving = true
    } else if (type === CONTROLLER_ENUM.BOTTOM) {
      this.targetY += 1
      this.isMoving = true
    } else if (type === CONTROLLER_ENUM.LEFT) {
      this.targetX -= 1
      this.isMoving = true
    } else if (type === CONTROLLER_ENUM.RIGHT) {
      this.targetX += 1
      this.isMoving = true
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
    } else if (type === CONTROLLER_ENUM.TURNRIGHT) {
      if(this.direction === DIRECTION_ENUM.TOP){
        this.direction = DIRECTION_ENUM.RIGHT
      } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
        this.direction = DIRECTION_ENUM.LEFT
      } else if (this.direction === DIRECTION_ENUM.LEFT) {
        this.direction = DIRECTION_ENUM.TOP
      } else if (this.direction === DIRECTION_ENUM.RIGHT) {
        this.direction = DIRECTION_ENUM.BOTTOM
      }
      this.state = ENTITY_STATE_ENUM.TURNRIGHT
    }
  }
  willBlock(inputDirection: CONTROLLER_ENUM) {
    const { targetY: y, targetX: x, direction } = this
    const { tileInfo } = DataManager.Instance
    const { mapRowCount: row, mapColumnCount: column } = DataManager.Instance
    const { x: doorX, y: doorY, state: doorState } = DataManager.Instance.door || {}
    if(inputDirection === CONTROLLER_ENUM.TOP){
      const playerNextY = y - 1
      if(direction === DIRECTION_ENUM.TOP){
        if(playerNextY<0) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        const weaponNextY = y-2
        const playerTile = tileInfo[x]?.[playerNextY]
        const weaponTile = tileInfo[x]?.[weaponNextY]
        //门判断
        if(
          ((doorX === x && doorY === playerNextY) || (doorX === x && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      } else if(direction === DIRECTION_ENUM.BOTTOM){
        if(playerNextY<0) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        const weaponNextY = y
        const playerTile = tileInfo[x]?.[playerNextY]
        const weaponTile = tileInfo[x]?.[weaponNextY]
        //门判断
        if(
          ((doorX === x && doorY === playerNextY) || (doorX === x && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      } else if(direction === DIRECTION_ENUM.LEFT){
        if(playerNextY<0) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        const weaponNextY = y - 1
        const weaponNextX = x - 1
        const playerTile = tileInfo[x]?.[playerNextY]
        const weaponTile = tileInfo[weaponNextX]?.[weaponNextY]
        //门判断
        if(
          ((doorX === x && doorY === playerNextY) || (doorX === weaponNextX && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
      } else if(direction === DIRECTION_ENUM.RIGHT){
        if(playerNextY<0) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
        const weaponNextY = y - 1
        const weaponNextX = x + 1
        const playerTile = tileInfo[x]?.[playerNextY]
        const weaponTile = tileInfo[weaponNextX]?.[weaponNextY]
        if(
          ((doorX === x && doorY === playerNextY) || (doorX === x && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
      const playerNextY = y + 1
      if(direction === DIRECTION_ENUM.TOP){
        if(playerNextY > column -1) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        } 
        const weaponNextY = y
        const playerTile = tileInfo[x]?.[playerNextY]
        const weaponTile = tileInfo[x]?.[weaponNextY]
        if(
          ((doorX === x && doorY === playerNextY) || (doorX === x && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      } else if(direction === DIRECTION_ENUM.BOTTOM){
        if(playerNextY > column - 1 ) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        const weaponNextY = y + 2
        const playerTile = tileInfo[x]?.[playerNextY]
        const weaponTile = tileInfo[x]?.[weaponNextY]
        //门判断
        if(
          ((doorX === x && doorY === playerNextY) || (doorX === x && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      } else if(direction === DIRECTION_ENUM.LEFT){
        if(playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        const weaponNextY = y + 1
        const weaponNextX = x - 1
        const playerTile = tileInfo[x]?.[playerNextY]
        const weaponTile = tileInfo[weaponNextX]?.[weaponNextY]
        //门判断
        if(
          ((doorX === x && doorY === playerNextY) || (doorX === weaponNextX && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
      } else if(direction === DIRECTION_ENUM.RIGHT){
        if(playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
        const weaponNextY = y + 1
        const weaponNextX = x + 1
        const playerTile = tileInfo[x]?.[playerNextY]
        const weaponTile = tileInfo[weaponNextX]?.[weaponNextY]
        //门判断
        if(
          ((doorX === x && doorY === playerNextY) || (doorX === weaponNextX && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
      const playerNextX = x - 1
      if(direction === DIRECTION_ENUM.TOP){
        if(playerNextX<0) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        const weaponNextY = y-1
        const weaponNextX = x-1
        const playerTile = tileInfo[playerNextX]?.[y]
        const weaponTile = tileInfo[weaponNextX]?.[weaponNextY]
        //门判断
        if(
          ((doorX === playerNextX && doorY === y) || (doorX === weaponNextX && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
      } else if(direction === DIRECTION_ENUM.BOTTOM){
        if(playerNextX<0) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
        const weaponNextY = y + 1
        const weaponNextX = x - 1
        const playerTile = tileInfo[playerNextX]?.[y]
        const weaponTile = tileInfo[weaponNextX]?.[weaponNextY]
        //门判断
        if(
          ((doorX === playerNextX && doorY === y) || (doorX === weaponNextX && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
      } else if(direction === DIRECTION_ENUM.LEFT){
        if(playerNextX<0) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        const weaponNextX = x - 2
        const playerTile = tileInfo[playerNextX]?.[y]
        const weaponTile = tileInfo[weaponNextX]?.[y]
        //门判断
        if(
          ((doorX === playerNextX && doorY === y) || (doorX === weaponNextX && doorY === y)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      } else if(direction === DIRECTION_ENUM.RIGHT){
        if(playerNextX<0) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        const weaponNextX = x 
        const playerTile = tileInfo[playerNextX]?.[y]
        const weaponTile = tileInfo[weaponNextX]?.[y]
        //门判断
        if(
          ((doorX === playerNextX && doorY === y) || (doorX === weaponNextX && doorY === y)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.RIGHT) {
      const playerNextX = x + 1
      if(direction === DIRECTION_ENUM.TOP){
        if(playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
        const weaponNextY = y - 1
        const weaponNextX = x + 1
        const playerTile = tileInfo[playerNextX]?.[y]
        const weaponTile = tileInfo[weaponNextX]?.[weaponNextY]
        if(
          ((doorX === playerNextX && doorY === y) || (doorX === weaponNextX && doorY === weaponNextY)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
      } else if(direction === DIRECTION_ENUM.BOTTOM){
        if(playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        const weaponNextY = y + 1
        const weaponNextX = x + 1
        const playerTile = tileInfo[playerNextX]?.[y]
        const weaponTile = tileInfo[weaponNextX]?.[weaponNextY]
        //判断门
        if (
          ((doorX === playerNextX && doorY === y) || (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
      } else if(direction === DIRECTION_ENUM.LEFT){
        if(playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        const weaponNextX = x
        const playerTile = tileInfo[playerNextX]?.[y]
        const weaponTile = tileInfo[weaponNextX]?.[y]
        //门判断
        if(
          ((doorX === playerNextX && doorY === y) || (doorX === weaponNextX && doorY === y)) && 
          doorState !== ENTITY_STATE_ENUM.DEATH
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      } else if(direction === DIRECTION_ENUM.RIGHT){
        if(playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        const weaponNextX = x + 2
        const playerTile = tileInfo[playerNextX]?.[y]
        const weaponTile = tileInfo[weaponNextX]?.[y]
        //判断门
        if (
          ((doorX === playerNextX && doorY === y) || (doorX === weaponNextX && doorY === y)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // return false
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.TURNLEFT) {
      let nextY,nextX
      if(direction === DIRECTION_ENUM.TOP){
        nextY = y - 1
        nextX = x - 1
      } else if(direction === DIRECTION_ENUM.BOTTOM){
        nextY = y + 1
        nextX = x + 1
      } else if(direction === DIRECTION_ENUM.LEFT){
        nextY = y + 1
        nextX = x - 1
      } else if(direction === DIRECTION_ENUM.RIGHT){
        nextY = y - 1
        nextX = x + 1
      }

      //最后判断地图元素
      if (
        (!tileInfo[x]?.[nextY] || tileInfo[x]?.[nextY].turnable) &&
        (!tileInfo[nextX]?.[y] || tileInfo[nextX]?.[y].turnable) &&
        (!tileInfo[nextX]?.[nextY] || tileInfo[nextX]?.[nextY].turnable)
      ) {
        // empty
      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT
        return true
      }
    } else if (inputDirection === CONTROLLER_ENUM.TURNRIGHT) {
      let nextX, nextY
      if (direction === DIRECTION_ENUM.TOP) {
        //朝上右转的话，右上角三个tile都必须turnable为true
        nextY = y - 1
        nextX = x + 1
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        nextY = y + 1
        nextX = x - 1
      } else if (direction === DIRECTION_ENUM.LEFT) {
        nextY = y - 1
        nextX = x - 1
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        nextY = y + 1
        nextX = x + 1
      }

      //最后判断地图元素
      if (
        (!tileInfo[x]?.[nextY] || tileInfo[x]?.[nextY].turnable) &&
        (!tileInfo[nextX]?.[y] || tileInfo[nextX]?.[y].turnable) &&
        (!tileInfo[nextX]?.[nextY] || tileInfo[nextX]?.[nextY].turnable)
      ) {
        // empty
      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT
        return true
      }
    }
  }
  willAttack(inputDirection: CONTROLLER_ENUM) {
    const enemies = DataManager.Instance.enemies.filter(
      (enemy: EntityManager) => enemy.state !== ENTITY_STATE_ENUM.DEATH,
    )
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i]
      const { x: enemyX, y: enemyY, id: enemyId} = enemy
      if (
        this.direction === DIRECTION_ENUM.TOP &&
        inputDirection === CONTROLLER_ENUM.TOP &&
        enemyY === this.targetY - 2 &&
        enemyX === this.x
      ) {
        this.state = ENTITY_STATE_ENUM.ATTACK
        return enemyId
      } else if (
        this.direction === DIRECTION_ENUM.BOTTOM &&
        inputDirection === CONTROLLER_ENUM.BOTTOM &&
        enemyY === this.targetY + 2 &&
        enemyX === this.x
      ) {
        this.state = ENTITY_STATE_ENUM.ATTACK
        return enemyId
      } else if (
        this.direction === DIRECTION_ENUM.LEFT &&
        inputDirection === CONTROLLER_ENUM.LEFT &&
        enemyX === this.targetX - 2 &&
        enemyY === this.y
      ) {
        this.state = ENTITY_STATE_ENUM.ATTACK
        return enemyId
      } else if (
        this.direction === DIRECTION_ENUM.RIGHT &&
        inputDirection === CONTROLLER_ENUM.RIGHT &&
        enemyX === this.targetX + 2 &&
        enemyY === this.y
      ) {
        this.state = ENTITY_STATE_ENUM.ATTACK
        return enemyId
      }
    }
    return ''
  }
}
