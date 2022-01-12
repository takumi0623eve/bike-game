//canvasで画面を作る
var c = document.createElement("canvas");
var ctx = c.getContext("2d");
c.width = 1000;
c.height = 500;

document.body.appendChild(c);

//凸凹の疑似乱数をつくる
var perm = []; //要素数は255

while(perm.length < 255) {
    while(perm.includes(val = Math.floor(Math.random() * 255)));
    perm.push(val);
}

//線形分離（道の凸凹を作る）
var lerp = (a, b, t) => a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2; //最後の乗算を変えることで道の見た目が変わる
var noise = x => {
    /*
    perm[]の要素数は255でc.widthは255以上であるため
    indexに不適切な値が入る
    →解決のために255で割った余りをindex指定する
    */
   x= x * 0.01 % 255; //0.01にすることでnoiceを拡大したような形を見せる
    return　lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x- Math.floor(x));
}

//player用
var player = new function() {
    this.x = c.width /2;
    this.y = 0;
    this.ySpeed = 0; //落下スピード
    this.rot = 0;
    this.rSpeed = 0; //回転スピード

    this.img = new Image();
    this.img.src = "images/moto.png";

    this.draw = function() {
        //playerを動かす
        var p1 = c.height - noise(t + this.x) * 0.25; //凸凹の高さを少し調整した値(山の斜面の境界の位置を示す)
        var p2 = c.height - noise(t + 5 +  this.x) * 0.25;

        var grounded = 0;

        if(p1 - 15 > this.y) { //山の斜面に一致するかどうか判定、-15は描画の高さ調整
            this.ySpeed += 0.1; //落ちるスピード調整
        } else{
            this.ySpeed -= this.y - (p1 - 15)/*上下運動(バウンド)を表現*/; //斜面に当たったら落ちなくなる
            this.y = p1 - 15; //-15は描画の高さ調整

            grounded = 1; //地面に触れているかの検知(0,1判断)
        }

        //ゲームオーバー管理
        if(!playing || grounded && Math.abs(this.rot)/*abs():絶対値*/ > Math.PI * 0.5){ //地面に設置しているかつPIの半分より大きければ
            playing = false;

            /*
            ゲームオーバーの動き
            加速してぐるぐるして後ろに下がっていく
            */
            this.rSpeed = 5;
            k.ArrowUp = 1;
            this.x -= speed * 5;

        }

        var angle = Math.atan2((p2 - 15) - this.y, (this.x + 5) - this.x);
        /*
        Math.atan2(y,x)に対して
        点(0,0)から点(x,y)までの半直線と、
        正のx軸の間の平面上での角度（ラジアン単位）を返す
        →座標から角度が分かる
        */

        //this.rot= angle;

        this.y += this.ySpeed;

        this.y += this.ySpeed; //降下していく

        if(grounded){
            this.rot -= (this.rot -angle) * 0.5; //地面に触れた時の角度調整
            this.rSpeed = this.rSpeed - (angle - this.rot);
        }

        this.rSpeed += (k.ArrowLeft - k.ArrowRight) * 0.5;
        this.rot -= this.rSpeed * 0.1; //回転調整

        if(this.rot > Math.PI) this.rot = -Math.PI;
        if (this.rot < -Math.PI) this.rot = Math.PI;

        ctx.save(); //現在の描画状態を保存する
        ctx.translate(this.x, this.y); //移動する
        ctx.rotate(this.rot); //画像だけの回転
        ctx.drawImage(this.img, -15 ,-15, 30, 30); //画像の座標、大きさ指定

        ctx.restore(); //描画状態を保存した時点のものに戻す
    }
}





var t = 0;
var speed = 0;
var playing = true; //ゲームオーバー管理
var k = {ArrowUp: 0, ArrowDown: 0, ArrowLeft: 0, ArrowRight: 0}; //仮想配列

//画面の連続描写をつくる
function loop() {
    speed -= (speed - (k.ArrowUp - k.ArrowDown)) * 0.1; //key入力で速度変化をみせる
    t+=3 * speed; //横に流れるアニメーションを見せるため
    ctx.fillStyle = "#19f";
    ctx.fillRect(0, 0, c.width, c.height);

    //凸凹を黒に描写する
    ctx.fillStyle= "black";

    ctx.beginPath();

    //新しいサブパスの開始点を座標指定する
    ctx.moveTo(0, c.height); //描画の左下隅に指定

    for(var i = 0; i < c.width; i++) {
        /*
        直前の座標と指定座標を結ぶ直線を引く
        */
        ctx.lineTo(i, c.height - noise(t + i) * 0.25); //c.heightから引くことで高さ調整、0.25をかけることで地面のような低さを見せる
    }

    ctx.lineTo(c.width, c.height); //描画の右下隅に指定

    ctx.fill();

    player.draw(); //player描写
    requestAnimationFrame(loop);
}

//keyを押しているか判断
onkeydown = d => k[d.key] = 1;
onkeyup = d => k[d.key] = 0;

loop();