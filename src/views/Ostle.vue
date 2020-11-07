<template>
  <div class="center">
    <div class="title">Ostle</div>
    <div class="header">
      <div class="player left">
        <TextField
          :name="playerList[0].name"
          :id="playerList[0].id"
          @change-value="changeName"
        />
        <div class="player-score">{{ leftScore }}</div>
        <div class="turn-lamp" :class="changeLampVClass">V</div>
      </div>
      <div class="player right">
        <div class="turn-lamp" :class="changeLampSClass">S</div>
        <div class="player-score">{{ rightScore }}</div>
        <TextField
          :name="playerList[1].name"
          :id="playerList[1].id"
          @change-value="changeName"
        />
      </div>
    </div>
    <div v-if="gameSet" class="message">{{ message }}</div>
    <button v-if="gameSet" @click="resetGame">RESET</button>
    <div class="board">
      <BoardSquare
        v-for="n in 25"
        :key="n"
        :id="n"
        :board="boardSquareList"
        :destinationIds="destinationList"
        :access="accessBoardList"
        :turn="playerList"
        :situation="selectPieceSituation"
        :finish="gameSet"
        @click-piece="selectPiece"
        @click-square="selectDirection"
        @click-clear="clearSelect"
      />
    </div>
  </div>
</template>

<script>
import TextField from "@/components/TextField.vue";
import BoardSquare from "@/components/BoardSquare.vue";

import { judgeDestination } from "@/common/judgeDestination";

export default {
  name: "Ostle",
  components: {
    TextField,
    BoardSquare,
  },
  data() {
    return {
      playerList: [
        {
          id: 1,
          name: "",
          turn: true,
        },
        {
          id: 2,
          name: "",
          turn: false,
        },
      ],

      leftScore: 0,
      rightScore: 0,
      selectPieceSituation: true, //動かすコマを選ぶ場面ならtrue
      gameSet: false, //決着がついたときにtrue
      message: "さんの勝利です", //勝利メッセ
      boardSquareList: [], //盤面情報の入った二次元配列
      destinationList: [], //行き先リスト（上、右、下、左の順）
      accessBoardList: [null, null, null, null], //行き先に動かせるならtrue
      keepPiece: "", //コマを入れ替える際の避難場所
      lastMove: { square: null, direction: null }, //前回の動きを保存
    };
  },
  created() {
    this.setStartBoard();
  },
  computed: {
    //ターンの人側の字が光る
    changeLampVClass() {
      return this.playerList[0].turn ? `on` : `off`;
    },
    changeLampSClass() {
      return this.playerList[1].turn ? `on` : `off`;
    },
  },
  watch: {
    gameSet() {
      if (this.gameSet) { //ゲーム終了時
        this.message =
          this.leftScore === 2
            ? this.playerList[0].name + this.message
            : this.playerList[1].name + this.message;
      } else { //リセット
        this.setStartBoard();
        this.leftScore = 0;
        this.rightScore = 0;
        this.playerList[0].turn = true;
        this.playerList[1].turn = false;
        this.message = "さんの勝利です";
      }
    },
  },
  methods: {
    changeName(index, value) {
      this.playerList[index - 1].name = value;
    },
    //二次元配列作成
    setStartBoard() {
      for (let i = 0; i < 25; i++) {
      if (i % 5 === 0) {
        this.boardSquareList[i] = "left";
      } else if (i % 5 === 4) {
        this.boardSquareList[i] = "right";
      } else if (i === 12) {
        this.boardSquareList[i] = "hole";
      } else {
        this.boardSquareList[i] = "";
      }
    }
    },
    //コマをクリックした際に行き先を判定
    async selectPiece(squareId, destinations) {
      for (let i = 0; i < 4; i++) {
        const target = this.boardSquareList[squareId - 1];
        const destination = await this.boardSquareList[destinations[i] - 1];
        this.accessBoardList[i] = judgeDestination(
          squareId,
          target,
          destination,
          this.lastMove,
          i
        );
      }
      this.destinationList = destinations;
      this.selectPieceSituation = false;
      this.keepPiece = "";
      // console.log(this.accessBoardList);
    },
    //行き先をクリックした際
    selectDirection(originId, squareId, directionId) {
      switch (this.boardSquareList[squareId - 1]) { //行き先のコマの有無で分岐
        case "":
          this.boardSquareList[squareId - 1] =
            this.boardSquareList[originId - 1];
          this.boardSquareList[originId - 1] = "";
          this.lastMove.square = squareId;
          this.lastMove.direction = directionId;
          break;
        default:
          this.lastMove = { square: null, direction: null };
          this.movePiece(originId, squareId, directionId);
          break;
      }
      this.accessBoardList = [null, null, null, null];
      this.selectPieceSituation = true;
      for (let i in this.playerList) {
        this.playerList[i].turn = !this.playerList[i].turn;
      }
    },
    //行き先にコマがあった際の処理
    async movePiece(activeId, passiveId, directionId) {
      const nextId = this.getNextSquare(passiveId, directionId); //行き先のその先のマスの番号
      const target = this.boardSquareList[passiveId - 1]; //行き先のマスにあるもの
      const destination = await this.boardSquareList[nextId - 1]; //行き先のその先のマスにあるもの
      if (
        await judgeDestination(
          passiveId,
          target,
          destination,
          this.lastMove,
          directionId
        )
      ) { //行き先のコマが消失しない場合
        const keepPieceShelter = this.keepPiece;
        this.keepPiece = this.boardSquareList[activeId - 1];
        this.boardSquareList[activeId - 1] = keepPieceShelter;
        this.continuePiece(passiveId, nextId, target, directionId);
      } else { //行き先のコマが消失する場合
        this.calcScore(passiveId);
        this.boardSquareList[passiveId - 1] =
          this.boardSquareList[activeId - 1];
        this.boardSquareList[activeId - 1] = this.keepPiece;
        this.lastMove = { square: null, direction: null };
      }
    },
    //動かす先のマスの数字を取得
    getNextSquare(id, key) {
      switch (key) {
        case 0:
          return id - 5;
        case 1:
          return id + 1;
        case 2:
          return id + 5;
        case 3:
          return id - 1;
      }
    },
    //行き先のその先にコマがあればループ、無ければ移動のみ
    continuePiece(activeId, passiveId, target, directionId) {
      switch (this.boardSquareList[passiveId - 1]) {
        case "":
          this.boardSquareList[passiveId - 1] = target;
          this.boardSquareList[activeId - 1] = this.keepPiece;
          this.lastMove.square = passiveId;
          this.lastMove.direction = directionId;
          break;
        default:
          this.movePiece(activeId, passiveId, directionId);
          break;
      }
    },
    //コマ選択を解除
    clearSelect() {
      this.accessBoardList = [null, null, null, null];
      this.selectPieceSituation = true;
    },
    //得点処理して2になったら終了へ
    calcScore(lostPieceId) {
      const lost = this.boardSquareList[lostPieceId - 1];
      if (lost === "left") {
        this.rightScore++;
        this.gameSet = this.rightScore > 1 ? true : false;
      } else {
        this.leftScore++;
        this.gameSet = this.leftScore > 1 ? true : false;
      }
    },
    //RESETボタンで初期化へ
    resetGame() {
      this.gameSet = false;
    }
  },
};
</script>

<style lang="scss" scoped>
.center {
  text-align: center;
}

.title {
  width: 100%;
  font-size: 32px;
  color: rgb(139, 91, 0);
  text-align: center;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  .player {
    width: 328px;
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0px 2px;
    &-score {
      font-size: 20px;
      width: 24px;
      height: 30px;
      text-align: center;
    }

    .turn-lamp {
      font-size: 20px;
      height: 30px;
      text-align: center;
    }

    .on {
      color: rgb(44, 197, 44);
    }

    .off {
      color: rgba(0, 0, 0, 0.6);
    }
  }

  .left {
    background: rgb(180, 96, 0);
    justify-content: flex-end;
    border-radius: 16px 0px 0px 16px;
  }

  .right {
    background: rgb(255, 217, 135);
    justify-content: flex-start;
    border-radius: 0px 16px 16px 0px;
  }
}

.message {
  width: 320px;
  text-align: center;
  white-space: pre-wrap;
  border-right: 4px solid silver;
  border-left: 4px solid silver;
  margin: 0px auto;
  margin-top: 8px;
}

button {
  font-size: 20px;
  border-radius: 5%;
  margin-top: 8px;
}

.board {
  width: 600px;
  height: 600px;
  background: rgba(224, 224, 224, 0.5);
  border-right: 8px solid rgba(70, 70, 70, 0.6);
  border-bottom: 8px solid rgba(70, 70, 70, 0.6);
  border-radius: 8px;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin: 0px auto;
  margin-top: 8px;
}
</style>