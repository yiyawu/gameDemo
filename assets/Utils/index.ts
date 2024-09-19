import { Layers, Node, SpriteFrame, UITransform } from 'cc'
/***
 * 生成指定长度随机uuid
 * @param n
 */
export const randomByLength = (n: number) =>
  Array.from({ length: n }).reduce<string>((total: string) => total + Math.floor(Math.random() * 10), '')
export const createUINode = (name: string = '') => {
  const node = new Node(name)
  const transform = node.addComponent(UITransform)
  transform.setAnchorPoint(0, 1)
  node.layer = 1 << Layers.nameToLayer('UI_2D')
  return node
}
export const randomByRange = (start: number,end: number) => Math.floor((end - start) * Math.random() + start)
const INDEX_REG = /\((\d+)\)/

const getNumberWithinString = (str: string) => parseInt(str.match(INDEX_REG)?.[1] || '0')

export const sortSpriteFrame = (spriteFrame: Array<SpriteFrame>) =>
  spriteFrame.sort((a, b) => getNumberWithinString(a.name) - getNumberWithinString(b.name))