# Todo List

1. Definição do Grafo:
    - Modele a ilha como um grafo.
    - Conecte vértices adjacentes por arestas não direcionadas.
    - Inclua um vértice para representar a praia.
1. Pontos de Vida e Ataque:
    - Personagem começa com 100 pontos de vida.
    - Criaturas também têm pontos de vida.
    - Pontos de ataque representam o dano causado.
1. Perigos Naturais e Armas:
    - Espalhe perigos naturais pela ilha (exceto na praia).
    - Inclua armas deixadas por aventureiros anteriores.
    - Cada arma tem um máximo de 3 usos.
1. Checkpoints e Limite de Tempo:
    - Defina até 3 vértices como checkpoints.
    - Se o personagem morrer após alcançar um checkpoint, ele ressurgirá lá.
    - O barco não esperará eternamente (3 vezes o número de arestas).
1. Movimentação Automática:
    - Implemente a movimentação automática entre vértices.
    - O programa decide os caminhos automaticamente.
    - Use grafos grade como exemplos.
1. Batalhas e Fuga:
    - Escolha enfrentar ou fugir de criaturas.
    - Batalhas ocorrem em 3 turnos alternados.
    - Pontos de vida e ataque são relevantes.
    - Gerenciamento de Tesouro:
1. Personagem transporta % do tesouro com base nos pontos de vida.
    - Armas afetam o percentual do tesouro.
    - Tesouro perdido não pode ser recuperado.
    - Implementação e Testes:
    - Implemente a lógica e teste diferentes cenários.
    - Verifique se o objetivo é alcançado dentro do limite de tempo.
