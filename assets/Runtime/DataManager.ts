import Singleton from '../Base/Singleton'
import { ITile } from '../Level'

class DataManager extends Singleton {
  static get Instance() {
    return super.getInstance<DataManager>()
  }
  mapInfo: Array<Array<ITile>>
  mapRowCount: number
  mapColumnCount: number
}
