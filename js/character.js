class Character {

	constructor(tile, sprite, hp) {
		this.move(tile);
		this.sprite = sprite;
		this.hp = hp;
	}

	//Обновления состояния противника 
	update() {
		if (this.enemyStunned) {
			this.enemyStunned = false;
			return;
		}
		this.doAction();
	}

	//Передвинуть персонажа
	move(tile) {
		if (this.tile) {
			this.tile.character = null;
		}
		this.tile = tile;
		tile.character = this;
	}

	//Проверка на возможность передвижения
	tryMove(dx, dy) {
		let newTile = this.tile.getNeighbor(dx, dy);
		if (newTile.passable) {
			if (!newTile.character) {
				this.move(newTile);
			}
			else {
				if (newTile.character.isPlayer) {
					newTile.character.hit(1);
				}
			}
			return true;
		}
	}

	//Функция для поиска игрока противником
	doAction() {

		let neighbors = this.tile.getNextPassableNeighbors();
		neighbors = neighbors.filter(t => !t.character || t.character.isPlayer);

		if (neighbors.length) {

			//Поиск наиболее подходящей по расстоянию клетки
			neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));

			let newTile = neighbors[0];
			this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
		}
	}

	//Функция для получения урона
	hit(damage) {
		this.hp -= damage;
		if (this.hp <= 0) {
			this.die();
		}
	}

	die() {
		this.dead = true;
		this.tile.character = null;
		const newSprite = new Image();
		newSprite.src = 'images/tile-.png';
		this.sprite = newSprite;
	}

	drawHp() {
		ctx.fillStyle = !this.isPlayer ? "red" : "green";
		ctx.fillRect(this.tile.x * tileSize, this.tile.y * tileSize, this.hp * 4, 2.5);
	}

	//Отрисовка персонажа
	draw() {
		drawSprite(this.sprite, this.tile.x, this.tile.y);
		this.drawHp();
	}

}

class Enemy extends Character {
	constructor(tile) {
		const sprite = new Image();
		sprite.src = 'images/tile-E.png';
		super(tile, sprite, 6);
	}
}

class Player extends Character {

	constructor(tile) {
		const sprite = new Image();
		sprite.src = 'images/tile-P.png';
		super(tile, sprite, 6);

		this.damage = 2;
		this.isPlayer = true;
	}

	attack() {

		// Нахождение ближайших противников
		const neighbors = this.tile.getNextNeighbors();
		const nearEnemies = neighbors.filter(t => t.character);

		if (nearEnemies.length >= 1) {
			nearEnemies.forEach(nearEnemy => {
				nearEnemy.character.hit(this.damage);
				//Оглушение противника
				if (Math.random() < 0.9) {
					if (nearEnemy.character) {
						nearEnemy.character.enemyStunned = true;
					}
				}
			});
			tick();
		}
	}
	tryMove(dx, dy) {
		if (super.tryMove(dx, dy)) {
			tick();
		}
	}
}