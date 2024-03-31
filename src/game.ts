import {
  EnemyTypes,
  Entity,
  Item,
  MedicineTypes,
  WeaponTypes,
} from "./game-types";
import { randElementOfArray, randInt } from "./func";
import { Weapon, Medicine } from "./equipments";
import { formatLongString } from "./func";
import readline from "readline-sync";
import { VertexName } from "./types";
import getdefaultMap from "./map";
import Player from "./player";
import Graph from "./graph";
import Enemy from "./enemy";

enum State {
  start = "start",
  confront = "confront",
  combat = "combat",
  none = "none",
  end = "end",
}

export class Game {
  private static instance: Game;
  public readonly island: Graph;
  public readonly beach: VertexName;
  public readonly treasure: VertexName;
  public readonly checkpoints: VertexName[];
  private enemies: Enemy[];
  private items: Item[];
  private state: State;
  private readonly player: Player;
  private gameOver: boolean;

  private constructor() {
    this.island = getdefaultMap();
    this.checkpoints = ["v0"];
    this.treasure =
      this.island.verticesNames[this.island.verticesNames.length - 1];
    this.beach = this.island.verticesNames[0];
    this.enemies = [];
    this.items = [];
    this.state = State.start;
    this.player = new Player(34, 100, this.beach);
    this.gameOver = false;
  }

  // Lê a entrada do jogador
  private getUserAction(
    showCombatOptions: boolean = false,
    showGameOver: boolean = false
  ): string {
    const next = "Escreva e envie 'a' para continuar: ";
    const ignore = `I - Para continuar\n`;
    const item = `P - Para pegar\n`;
    const run = `C - Para correr\n`;
    const fight = `L - Para lutar\n`;
    const exit = `exit - para sair\n`;

    if (showGameOver) {
      return readline.question("Voce morreu! " + next);
    }

    return readline.question(
      `${
        showCombatOptions
          ? "Você encontrou um inimigo! Selecione uma acao:\n" + run + fight
          : "Tudo limpo! " + next
      }`
    );
  }

  // Retorna uma lista de vertices excluindo a praia o tesesouro e seus vizinhos
  private getFreeVertex() {
    const blacklist = [
      ...this.island.getNeighborhood(this.beach),
      ...this.island.getNeighborhood(this.treasure),
      this.beach,
      this.treasure,
    ];

    return this.island.verticesNames.filter((value) => {
      if (!blacklist.includes(value)) return value;
    });
  }

  // Cria uma caminho aleatorio até da praia para o tesouro
  private getPathBetweenBeachAndTreasure(reverse: boolean = false) {
    const vertexList = this.getFreeVertex();
    const middleVertex = vertexList[randInt(0, vertexList.length - 1)];

    let [firstStep, lastStep] = [
      this.island.dijkstra(this.beach).get(middleVertex)!,
      this.island.dijkstra(middleVertex).get(this.treasure)!,
    ];

    if (reverse) {
      firstStep.path.reverse();
      lastStep.path.reverse();

      let temp = firstStep;
      firstStep = lastStep;
      lastStep = temp;
    }

    return {
      path: [
        ...firstStep.path,
        ...lastStep.path.filter((vertex) => vertex !== middleVertex),
      ],
      distance: firstStep.distance + lastStep.distance,
    };
  }

  // Cria um caminho de ida e volta para a praia
  private getPlayerMoves() {
    const { path: go } = this.getPathBetweenBeachAndTreasure();
    const { path: back } = this.getPathBetweenBeachAndTreasure(true);

    return {
      pos: 0,
      path: go.concat([...back].filter((vertex) => vertex !== go.at(-1))),
      wasTreasureFound: false,
    };
  }

  // Posiciona os inimigos na ilha
  private setEnemiesOnIsland() {
    const numMaxOfEnemies = Math.ceil(this.island.verticesNames.length * 0.3);
    const vertexList = this.getFreeVertex();
    const enemies = Object.values(EnemyTypes);

    for (let i = 0; i < numMaxOfEnemies; i++) {
      this.enemies.push(
        new Enemy(
          `${vertexList[randInt(0, vertexList.length - 1)]}`,
          enemies[i % 3],
          randInt(10, 45)
        )
      );
    }
  }

  // Posiciona os items na ilha
  private setItemsOnIsland() {
    const numMaxOfItems =
      Math.ceil(this.island.verticesNames.length * 0.25) - 2;
    const vertexList = this.getFreeVertex();

    this.items.push(new Medicine(MedicineTypes.BandAid, 30, this.treasure));
    this.items.push(
      new Weapon(
        WeaponTypes.WoodStick,
        randInt(40, 99),
        vertexList[randInt(0, vertexList.length - 1)]
      )
    );

    for (let i = 0; i < numMaxOfItems; i++) {
      let isMedecine = randInt(0, 1);
      let value = randInt(30, 99);
      let vertex = vertexList[randInt(0, vertexList.length - 1)];

      this.items.push(
        isMedecine
          ? new Medicine(
              randElementOfArray<MedicineTypes>(Object.values(MedicineTypes)),
              value,
              vertex
            )
          : new Weapon(
              randElementOfArray<WeaponTypes>(Object.values(WeaponTypes)),
              value,
              vertex
            )
      );
    }
  }

  // Verifica a batalha entre inimigos e movimenta os inimigos
  private updateEnemies() {
    let enemiesMap = new Map<VertexName, Enemy>();

    this.enemies.forEach((enemy) => {
      let nextMove = [
        enemy.position,
        ...this.island.getNeighborhood(enemy.position),
      ];
      enemy.position = randElementOfArray(nextMove);

      if (enemiesMap.has(enemy.position)) {
        let otherEnemy = enemiesMap.get(enemy.position)!;

        this.state = State.confront;

        console.log(
          `\nVeja! Um(a) ${enemy.type} está enfrentando um(a) ${otherEnemy.type} no vértice ${enemy.position}`
        );

        if (otherEnemy.attackDamage > enemy.attackDamage) {
          enemiesMap.set(enemy.position, enemy);
          enemy.position = randElementOfArray(this.island.verticesNames);
          enemiesMap.set(enemy.position, otherEnemy);
          console.log(
            `Oh! Um(a) ${enemy.type} derrotou um(a) ${otherEnemy.type}\n`
          );
        } else {
          enemiesMap.set(enemy.position, otherEnemy);
          enemy.position = randElementOfArray(this.island.verticesNames);
          enemiesMap.set(enemy.position, enemy);
          console.log(
            `Oh! Um(a) ${otherEnemy.type} derrotou um(a) ${enemy.type}\n`
          );
        }
      } else {
        enemiesMap.set(enemy.position, enemy);
      }
    });
  }

  // Mostra a cutscene inicial
  private showIntro() {
    const intro = [
      "\nBem vindo a Ilha Esquecida\n",
      "\nEm um mundo onde os mapas ainda guardam espacos em branco, voce eh um explorador destemido, pronto para desbravar o desconhecido. A Ilha Esquecida, um lugar de lendas e misterios, eh o seu destino. Dizem que piratas esconderam um tesouro inestimavel em suas terras, mas nenhum que pisou em suas praias retornou para contar a historia.\n",
      "\nAgora, voce se encontra à beira desta terra proibida, onde perigos mortais e criaturas miticas espreitam nas sombras. Com coragem e astucia, voce deve navegar por caminhos traicoeiros, enfrentar feras lendarias e desvendar os segredos da ilha para reivindicar o tesouro perdido.\n",
      "\nMas lembre-se, aventureiro: na Ilha Esquecida, cada passo pode ser o ultimo. Sua jornada sera repleta de escolhas dificeis e consequencias imprevisiveis. Sera que voce encontrara a gloria e a fortuna, ou se tornara mais um sussurro entre as arvores da ilha amaldicoada?\n",
      "\nDigite 'a' para continuar sua jornada",
      "\nDigite 's' para sair",
      "\n\nVocê acordou na praia",
    ].reduce((prev, current) => prev + current);

    formatLongString(intro).forEach((value) => console.log(value));
  }

  // Retorna o jogo 
  public static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }

    return Game.instance;
  }

  // Inicia o jogo
  public run(): void {
    let action = "start";
    const travel = this.getPlayerMoves();
    const playerWalk: string[] = [];
    this.setEnemiesOnIsland();
    this.setItemsOnIsland();

    this.player.move(this.checkpoints.at(-1)!);
    this.showIntro();

    while (!this.gameOver && action !== "s" && action !== "sair") {
      // Monta o hud por onde o player passou
      if (playerWalk.length) {
        console.log(
          `HP: ${this.player.healthPoints} DAMAGE: ${
            this.player.attackDamage
          } MONEY: ${this.player.foundTreasure ? this.player.bagWeight : 0}`,
          `\nMAPA: ${playerWalk
            .map((pos, index, array) => {
              if (index !== array.length - 1) return `${pos} => `;
              else return pos;
            })
            .reduce((prev, next) => prev + next)}\n`
        );
      }

      // Lê a entrada do jogador
      action = this.getUserAction().toLowerCase();

      // Inicia a movimentação dos inimigos apos sair da praia pela primeira vez
      if (this.state !== State.start) this.updateEnemies();
      if (this.state === State.confront) {
        this.state = State.none;
        continue;
      }

      // Verifica a ação do usuario
      switch (action) {
        case "a":
          this.player.move(travel.path.at(travel.pos)!);
          playerWalk.push(this.player.pos);

          // Verifica se é possivel usar items
          for (let item of this.items) {
            let oldHP = this.player.healthPoints;
            let oldAttack = this.player.attackDamage;
            let oldMoney = this.player.bagWeight;
            let status = {
              hp: "Não mudou",
              attack: "Não mudou",
              money: "Não mudou",
            };

            // O usuario achou o item
            if (this.player.pos === item.position) {
              action = readline.question(
                `\nVeja  voce encontrou um(a) ${item.type}!\nO que deseja fazer\ni - ignorar\nu - usar\n`
              );

              // O usuario quer usar o item
              if (action === "u") {
                let isWeapon = true; // Essa variavel e para saber se o item é uma cura ou arma

                // Testa para ver se não um item é uma cura
                for (let type of Object.values(MedicineTypes)) {
                  if (type === item.type) {
                    isWeapon = false;
                    break;
                  }
                }

                // Usa o item e o remove da lista de items
                item.useItem(this.player);
                this.items.splice(this.items.indexOf(item));

                if (isWeapon) {
                  // expressão ? valor1 : valor2 é um if ternario
                  // Atualiza os status do jogador apos usar um item 
                  status.attack =
                    oldAttack > this.player.attackDamage
                      ? "Diminuiu"
                      : "Aumentou";
                  console.log(
                    `\nVoce equipou ${item.type} seu dano foi alterado`
                  );
                } else
                  status.hp =
                    this.player.healthPoints === 100
                      ? "Foi restaurada"
                      : "Aumentou";
                console.log(`\nVoce usou ${item.type} sua vida foi alterada`);
              } else {
                console.log("Voce ignorou o item");
              }

              console.log(
                `HP: ${oldHP} -> ${this.player.healthPoints} (${status.hp})`,
                `\nDAMAGE: ${oldAttack} -> ${this.player.attackDamage} (${status.attack})`,
                `\nMONEY: ${oldMoney} -> ${
                  this.player.foundTreasure ? this.player.bagWeight : 0
                } (${status.money})\n`
              );
            }
          }

          // Verifica se há um combate do jogador e um inimigo
          for (let enemy of this.enemies) {
            if (this.player.pos === enemy.position) {
              action = readline.question(
                `Oh Nao voce encontrou um(a) ${enemy.type}!\nO que deseja fazer\nf - fugir\nl - lutar\n`
              );

              // Jogador aceita o combate
              if (action === "l") {
                for (let i = 0; i < 3; i++) {
                  console.log(`\nROUND ${i + 1}`);

                  // Jogador ainda esta vivo
                  if (this.player.healthPoints > 0) {
                    // Verifica se houve um desvio do ataque
                    if (randInt(0, 9) === 0) {
                      console.log(
                        `\nOh no! ${enemy.type} desviou do seu ataque`
                      );
                    } else {
                      this.player.attack(enemy);
                      console.log(
                        `\nVoce causou ${this.player.attackDamage} em ${enemy.type}`
                      );
                    }
                  } else { // Jogador perdeu
                    console.log("\nGameOver");
                    this.gameOver = true;
                    break;
                  }

                  // inimigo ainda está vivo
                  if (enemy.healthPoints > 0) {
                    // Verifica se houve um desvio do ataque
                    if (randInt(0, 9) === 0) {
                      console.log(
                        `\nBoa! voce desviou do ataque do ${enemy.type}`
                      );
                    } else {
                      enemy.attack(this.player);
                      console.log(
                        `${enemy.type} causou ${enemy.attackDamage} em voce`,
                        `${
                          this.player.foundTreasure
                            ? `Oh não voce perdeu um ${enemy.attackDamage}% do tesouro na batalha`
                            : ""
                        }`
                      );

                      // Verifica se jogador morreu durante da batalha
                      if (this.player.healthPoints === 0) {
                        console.log("\nGameOver");
                        this.gameOver = true;
                        break;
                      }
                    }
                  } else {
                    console.log(`\nVoce venceu ${enemy.type}`);
                    this.enemies.splice(this.enemies.indexOf(enemy)); // Remove o inimigo morto
                    break;
                  }
                  
                  // Lê a proxima ação do jogador
                  action = readline.question(
                    `Seu HP e ${this.player.healthPoints} O que deseja fazer a seguir\nf-fugir\nl-lutar\n`
                  );

                  // jogador decidiu fugir
                  if (action === "f") {
                    enemy.attack(this.player);
                    console.log(
                      `${enemy.type} causou ${this.player.attackDamage} em voce`,
                      `${
                        this.player.foundTreasure
                          ? `Oh não voce perdeu um ${enemy.attackDamage}% do tesouro na batalha`
                          : ""
                      }`,
                      "\nvoce fugiu"
                    );

                    break;
                  } else if (action === "s") { 
                    console.log("Fechando jogo");
                    this.gameOver = true;
                    break;
                  }
                }
              } else if (action === "s") { // Sair do jogo
                console.log("Fechando jogo");
                this.gameOver = true;
                break;
              } else { // Jogador decidiu fugir
                enemy.attack(this.player);
                if (this.player.healthPoints > 0) {
                  console.log(
                    `\n${enemy.type} causou ${this.player.attackDamage} em voce`,
                    `${
                      this.player.foundTreasure
                        ? "\nOh não voce perdeu uma parte do tesouro na batalha"
                        : ""
                    }`,
                    `\nvoce fugiu`
                  );
                } else {
                  // Verifica se jogador morreu durante a fuga
                  console.log("\nGameOver");
                  this.gameOver = true;
                  break;
                }
              }

              // Fim da batalha
              console.log(
                `Fim da Batalha. Voce esta com ${this.player.healthPoints} de HP`
              );
            }
          }


          // Verifica se jogador morreu depois da batalha
          if (this.gameOver) {
            console.log("Fim de jogo");
            break;
          }
          
          // Verifica se jogador achou um tesouro
          if (!travel.wasTreasureFound) {
            travel.wasTreasureFound = this.player.pos === this.treasure;
          }

          travel.pos++;

          console.log(`Você chegou ao vertice: ${this.player.pos}\n`);

          this.state = State.none;

          break;

        case "s": // Sair do jogo
          this.gameOver = true;
          break;
      }

      // Jogador achou o tesouro nesta rodada
      if (travel.wasTreasureFound && this.player.pos === this.treasure) {
        this.player.foundTreasure = true;

        console.log(
          `\nVocê achou o tesouro perdido! ${
            this.player.bagWeight < 100
              ? "Seu HP esta baixo nao podera levar tudo"
              : "Pegue tudo que puder!"
          }`,
          `\nMONEY: 0 -> ${this.player.bagWeight} (Aumentou)`,
          "\nAgora volte em segurança para a praia para usufruir dos seus ganhos"
        );
      }

      // Jogador ganhou
      if (travel.wasTreasureFound && this.player.pos === this.beach) {
        console.log(
          `Parabens você recuperou ${this.player.bagWeight}% do tesouro perdido!`
        );

        this.gameOver = true;
      }
    }
  }
}
