<template>
  <div v-if="situation && !finish" class="box" @click="selectPiece">
    <ThePiece v-if="board[id - 1] === 'left'" :class="setPieceColor" />
    <ThePiece v-else-if="board[id - 1] === 'right'" :class="setPieceColor" />
    <BlackHole v-else-if="board[id - 1] === 'hole'" />
  </div>
  <div v-else-if="!finish" :class="['box', setDestination]" @click="selectDirection">
    <ThePiece v-if="board[id - 1] === 'left'" :class="setPieceColor" />
    <ThePiece v-else-if="board[id - 1] === 'right'" :class="setPieceColor" />
    <BlackHole v-else-if="board[id - 1] === 'hole'" />
  </div>
  <div v-else class="box">
    <ThePiece v-if="board[id - 1] === 'left'" :class="setPieceColor" />
    <ThePiece v-else-if="board[id - 1] === 'right'" :class="setPieceColor" />
    <BlackHole v-else-if="board[id - 1] === 'hole'" />
  </div>
</template>

<script>
import ThePiece from "@/components/ThePiece.vue";
import BlackHole from "@/components/BlackHole.vue";

export default {
  name: "BoardSquare",
  components: {
    ThePiece,
    BlackHole,
  },
  props: {
    id: Number,
    board: Array,
    destinationIds: Array,
    access: Array,
    turn: Object,
    situation: Boolean,
    finish: Boolean,
  },
  computed: {
    setPieceColor() {
      return this.board[this.id - 1] === "left" ? `leftPiece` : `rightPiece`;
    },
    setDestination() {
      return this.accessDestination(this.id) ? `destination` : ``;
    },
  },
  methods: {
    //コマを選択した際の処理
    selectPiece() {
      const destinationList = []; //隣接するマスの番号のリスト
      destinationList[0] = this.id - 5;
      destinationList[1] = this.id + 1;
      destinationList[2] = this.id + 5;
      destinationList[3] = this.id - 1;
      switch (this.board[this.id - 1]) {
        case "left":
          if (this.turn[0].turn) { //そのコマの持ち主かどうか
            this.$emit("click-piece", this.id, destinationList);
          }
          break;
        case "right":
          if (this.turn[1].turn) {
            this.$emit("click-piece", this.id, destinationList);
          }
          break;
        case "hole":
          this.$emit("click-piece", this.id, destinationList);
          break;
      }
    },
    //行き先を選択した際の処理
    async selectDirection() {
      if (this.accessDestination(this.id)) { //移動可能かどうか
        const direction = this.destinationIds.indexOf(this.id); //動く方向
        let origin; //大元のマスを特定
        switch (direction) {
          case 0:
            origin = this.id + 5;
            break;
          case 1:
            origin = this.id - 1;
            break;
          case 2:
            origin = this.id - 5;
            break;
          case 3:
            origin = this.id + 1;
            break;
        }
        this.$emit("click-square", origin, this.id, direction);
      } else {
        await this.$emit("click-clear");
        this.selectPiece(); //行き先でないコマをクリックしたらそのコマを選択させる
      }
    },
    //行き先のマスかを判定
    accessDestination(i) {
      if (this.destinationIds[0] === i && this.access[0]) {
        return true;
      } else if (this.destinationIds[1] === i && this.access[1]) {
        return true;
      } else if (this.destinationIds[2] === i && this.access[2]) {
        return true;
      } else if (this.destinationIds[3] === i && this.access[3]) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.box {
  width: 20%;
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed black;
  padding: 4px;
  .leftPiece {
    background: rgb(180, 96, 0);
  }
  .rightPiece {
    background: rgb(255, 217, 135);
  }
  &:hover {
    background: rgba(193, 193, 193, 0.6);
  }
}

.destination {
  background: rgba(128, 255, 0, 0.3);
  border-color: chartreuse;
}
</style>