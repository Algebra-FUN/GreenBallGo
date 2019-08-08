//全局参数
var cvs = wx.createCanvas();
var ctx = cvs.getContext('2d');
var stage_width = cvs.width;
var stage_height = cvs.height;

var v = 4;//unit:px/f
var Acc = [0,0,0];

wx.setPreferredFramesPerSecond(60)//设置帧频 unit:f/s
wx.startAccelerometer({
  interval: 'game'
})
wx.onAccelerometerChange(function (res) {
  Acc[0] = res.x;
  Acc[1] = res.y;
  Acc[2] = res.z;
})
activity(onGame);

//重置舞台
function refreshStage(){
  ctx.clearRect(0, 0, stage_width, stage_height)//清台

  //设置背景
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, stage_width, stage_height)
}

var wall_y_Arr = [0, -stage_height / 3, -stage_height * 2 / 3]
var hole_x_Arr = [stage_width / 3, 0, stage_width * 2 / 3]
var hole_width = stage_width / 3;
var n = 0;
var i = 0 ;

var ball_x = stage_width / 2
var ball_v = 0;
var ball_r = stage_width / 30;

function drawBall(){
  ball_v = Acc[0]*30*(stage_width/375)
  ctx.beginPath();
  ctx.arc(ball_x, stage_height - 3*ball_r, ball_r, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();
  ball_x += ball_v;
  if (ball_x < 0 | ball_x > stage_width - ball_r){
    ball_x = ( ball_x + stage_width ) % stage_width;
    return;
  }
}

function drawWall(){
  for(index = 0 in wall_y_Arr){
    if (wall_y_Arr[index] > stage_height) {
      wall_y_Arr[index] = 0;
      hole_x_Arr[index] = Math.random() * stage_width * 2 / 3;
      n++;
      i++;
      if(n == 3){
        n = 0;
      }
    }
    ctx.fillStyle = 'red'
    ctx.fillRect(0, wall_y_Arr[index], stage_width, stage_height / 50)
    ctx.fillStyle = 'black'
    ctx.fillRect(hole_x_Arr[index] - 1, wall_y_Arr[index], hole_width , stage_height / 50 + 2)
    wall_y_Arr[index] += v
  }
}

function check(){
  var ball_u_y = stage_height - ball_r * 4;//球上端
  var ball_d_y = stage_height - ball_r * 2;//球下端

  var wall_u_y = wall_y_Arr[n];//墙上端
  var wall_d_y = wall_y_Arr[n] + stage_height / 50;//墙下端

  var b1 = ball_d_y < wall_u_y;
  var b2 = ball_u_y > wall_d_y;

  if (b1|b2){
    return;
  }

  var ball_l_x = ball_x;//球左端；
  var ball_r_x = ball_x + ball_r*2;//球右端；

  var hole_l_x = hole_x_Arr[n];//洞左端
  var hole_r_x = hole_x_Arr[n] + hole_width;//洞右端

  b1 = ball_l_x <= hole_l_x;
  b2 = ball_r_x >= hole_r_x;

  if(b1|b2){
    onGame = false;
    v = 0;
    wx.vibrateLong({})
    wx.stopAccelerometer({})
  }

}

var onGame = true;

function onGameOver(){
  v = 0;
  ctx.font = "italic 50px 黑体";
  ctx.fillStyle = "green";
  ctx.fillText("GAME OVER", stage_width / 2 - 160, stage_height/3);
  ctx.font = "italic 50px 黑体";
  ctx.fillStyle = "green";
  ctx.fillText("SCORE："+i, stage_width / 2 - 141, stage_height / 2);
  ctx.font = "italic 40px 黑体";
  ctx.fillStyle = "green";
  ctx.fillText("TAP TO RESTART", stage_width / 2 - 170, stage_height * 2 / 3);
  wx.onTouchEnd(function (e) {
    if (!onGame){
      onGame = true;
      resetData();
    }
})
}

function resetData(){
  wall_y_Arr = [0, -stage_height / 3, -stage_height * 2 / 3]
  hole_x_Arr = [stage_width / 3, 0, stage_width * 2 / 3]
  hole_width = stage_width / 3;
  n = 0;
  i = 0;
  ball_x = stage_width / 2
  ball_v = 0;
  ball_r = stage_width / 30;
  wx.startAccelerometer({
    interval: 'game'
  })
}

function activity() {
  if (onGame) {
    refreshStage();
    v = stage_height / 160 + i / 6;
    check();
    drawWall();
    drawBall();
  }else{
    onGameOver();
  }
  requestAnimationFrame(activity);
}
