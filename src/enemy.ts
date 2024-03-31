import { EnemyTypes, Entity } from "./game-types";
import { VertexName } from "./types";
import { minmax } from "./func";

export default class Enemy implements Entity {
  private health: number;

  constructor(
    public position: string,
    public readonly type: EnemyTypes,
    public readonly attackDamage: number
  ) {
    this.health = 100;
  }

  get healthPoints() {
    return this.health;
  }

  set healthPoints(value: number) {
    this.health = minmax(value, 0, 100);
  }

  public move(vertex: VertexName): void {
    this.position = vertex;
  }

  public attack(aim: Entity): void {
    aim.takeDamage(this.attackDamage);
  }

  public takeDamage(damage: number): void {
    this.health = minmax(this.health - damage, 0, 100);
  }

  public respawn(checkpoint: VertexName): void {
    this.move(checkpoint);
    this.health = 100;
  }
}
