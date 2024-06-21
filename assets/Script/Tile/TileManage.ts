import { _decorator, Component, Sprite, SpriteFrame, UITransform } from 'cc'
import levels from '../../Levels'

export const TILE_WIDTH = 50
export const TILE_HEIGHT = 50
const { ccclass, property } = _decorator
@ccclass('TileManager')
export class TileManager extends Component {
  init(spriteFrame: SpriteFrame, i: number, j: number) {
    const sprite = this.addComponent(Sprite)
    sprite.spriteFrame = spriteFrame
    //设置ui格式
    const transform = this.addComponent(UITransform)
    transform.setContentSize(TILE_WIDTH, TILE_HEIGHT)
    this.node.setPosition(i * TILE_WIDTH, -j * TILE_HEIGHT)
  }
}
