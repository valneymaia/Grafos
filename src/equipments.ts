import { minmax } from "./func";
import { WeaponTypes, Item, Entity, MedicineTypes } from "./game-types";
import { VertexName } from "./types";

export class Weapon implements Item {
  constructor(
    public readonly type: WeaponTypes,
    public readonly value: number,
    public position: VertexName
  ) {}

  public useItem(entity: Entity): void {
    entity.attackDamage = minmax(this.value, entity.attackDamage, 99);
  }
}

export class Medicine implements Item {
  constructor(
    public readonly type: MedicineTypes,
    public readonly value: number,
    public position: VertexName
  ) {}

  public useItem(entity: Entity): void {
    entity.healthPoints = minmax(entity.healthPoints + this.value, 35, 100);
  }
}
