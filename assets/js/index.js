"use strict";

/**************************************************
 * イベント
 **************************************************/
$(function (){
  // 地図(API)
  $('#btnMapApi').on('click', function (){
    dispMyPlaceApi();
  });

  $('#btnCloseMapApi').on('click', function (){
    $('#collapseMapApi').collapse('hide'); // 地図エリアを非表示
    $('#btnMapApi').prop('disabled', false);
  });

  // 地図(Embed)
  $('#btnMapEmbed').on('click', function (){
    dispMyPlaceEmbed();
  });

  $('#btnCloseMapEmbed').on('click', function (){
    $('#collapseMapEmbed').collapse('hide'); // 地図エリアを非表示
    $('#btnMapEmbed').prop('disabled', false);
  });

  // カメラ(File)
  var myStream;
  var URL = window.URL || window.webkitURL;
  var myUrl;

  $('#btnCameraFile').on('change', function() {
    var jqueryInput = $(this);
    var numFiles = jqueryInput.get(0).files ? jqueryInput.get(0).files.length : 0;
    var label = jqueryInput.val().replace(/\\/g, '/').replace(/.*\//, '');
    $('#resultCameraFile').html('<p>' + label + '</p>');

    if(numFiles > 0){
      if(!window.FileReader){
        return false;
      }
    
      var file = jqueryInput.get(0).files[0];
      try {
        // createObjectURLが利用可能な場合
        myUrl = URL.createObjectURL(file);
        $('#imgCameraFile').html('<img src="' + myUrl + '" class="card-img-bottom" ></img>');
      }catch (e){
        // createObjectURLが利用不可な場合
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend  = function () {
          $('#imgCameraFile').html('<img src="' + this.result + '" class="card-img-bottom" ></img>');
        }
      }

      $(this).prop('disabled', true);
      $(this).parent().addClass("disabled");
      $('#collapseCameraFile').collapse('show'); // イメージエリアを表示
    } else {
      $('#collapseCameraFile').collapse('hide'); // イメージエリアを非表示
      $('#imgCameraFile').empty();
      $(this).parent().removeClass("disabled");
      $(this).prop('disabled', false);
    }
  });

  $('#btnCloseCameraFile').on('click', function (){
    if(!!URL && !!myUrl) {
      URL.revokeObjectURL(myUrl);
    }
    $('#btnCameraFile').val('').change(); // ファイルクリア(非表示化はchangeイベントに任せる)
  });

  // カメラ(Media)
  $('#btnCameraMedia').on('click', function (){
    $(this).prop('disabled', true);
    $(this).children('i').replaceWith('<i class="spinner-border" style="width: 1.5rem; height: 1.5rem;" role="status" aria-hidden="true"></i>');
    $('#imgCameraMedia').html('<video id="videoCameraMedia" class="card-img-bottom" playsinline muted></video>');
    startCameraMedia().then(function(stream) {
      var video = document.getElementById("videoCameraMedia");
      myStream = stream;
      if("srcObject" in video){
        video.srcObject = myStream;
      }else{
        video.src = window.URL.createObjectURL(myStream);
      }
      video.onloadedmetadata = function(e) {
        video.play();
      };
      $('#btnCaptureCameraMedia').prop('disabled', false);
      $('#collapseCameraMedia').collapse('show'); // イメージエリアを表示
      $('#btnCameraMedia').children('i').replaceWith('<i class="fas fa-camera">');
    })
    .catch(function(err) {
      alert(err.name + ": " + err.message);
      console.log(err.name + ": " + err.message);
      if(!!myStream) {
        myStream.getTracks().forEach(function(track) {
          track.stop();
        });
      }
      $('#imgCameraMedia').empty();
      $('#btnCameraMedia').prop('disabled', false).children('i').replaceWith('<i class="fas fa-camera">');
    });
  });

  $('#btnCaptureCameraMedia').on('click', function (){
    $(this).prop('disabled', true);

    var jqueryVideo = $('#videoCameraMedia');
    var width = jqueryVideo.width();
    var height = jqueryVideo.height();

    $('#imgCameraMedia').html('<canvas id="canvasCameraMedia" class="card-img-bottom" width="' + width + '" height="' + height + '"></canvas>');
    $('#canvasCameraMedia').get(0).getContext("2d").drawImage(jqueryVideo.get(0), 0, 0, width, height);
    if(!!myStream) {
      myStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
  });

  $('#btnCloseCameraMedia').on('click', function (){
    $('#collapseCameraMedia').collapse('hide'); // イメージエリアを非表示
    if(!!myStream) {
      myStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
    $('#imgCameraMedia').empty();
    $('#btnCameraMedia').prop('disabled', false);
  });

  // QRスキャン(Media)
  $('#btnQrScanMedia').on('click', function (){
    $(this).prop('disabled', true);
    $(this).children('i').replaceWith('<i class="spinner-border" style="width: 1.5rem; height: 1.5rem;" role="status" aria-hidden="true"></i>');
    $('#imgQrScanMedia').html(
      '<video id="videoQrScanMedia" class="card-img-bottom" playsinline muted></video>' +
      '<canvas id="canvasQrScanMedia" class="card-img-bottom d-none"></canvas>'
    );
    
    startCameraMedia().then(function(stream) {
      var video = document.getElementById("videoQrScanMedia");
      var canvas = document.getElementById("canvasQrScanMedia");
      var canvasCtx = canvas.getContext("2d");
      myStream = stream;
      if("srcObject" in video){
        video.srcObject = myStream;
      }else{
        video.src = window.URL.createObjectURL(myStream);
      }
      video.onloadedmetadata = function(e) {
        video.play();

        scanQr(canvas, canvasCtx);
      };
      $('#collapseQrScanMedia').collapse('show'); // イメージエリアを表示
      $('#btnQrScanMedia').children('i').replaceWith('<i class="fas fa-qrcode">');
    })
    .catch(function(err) {
      alert(err.name + ": " + err.message);
      console.log(err.name + ": " + err.message);
      if(!!myStream) {
        myStream.getTracks().forEach(function(track) {
          track.stop();
        });
      }
      $('#imgQrScanMedia').empty();
      $('#btnQrScanMedia').prop('disabled', false).children('i').replaceWith('<i class="fas fa-qrcode">');
    });
  });

  $('#btnCloseQrScanMedia').on('click', function (){
    $('#collapseQrScanMedia').collapse('hide'); // イメージエリアを非表示
    if(!!myStream) {
      myStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
    $('#resultQrScanMedia').empty();
    $('#imgQrScanMedia').empty();
    $('#btnQrScanMedia').prop('disabled', false);
  });

  // クレジットカードスキャン
  $('#btnCardScan').on('click', function (){
    $(this).prop('disabled', true);
    $('#collapseCardScan').collapse('show'); // イメージエリアを表示
  });

  $('#btnCloseCardScan').on('click', function (){
    $('#collapseCardScan').collapse('hide'); // カードエリアを非表示
    $('#btnCardScan').prop('disabled', false);
  });
});

/**************************************************
 * 地図(API)
 **************************************************/
// 地図表示
function dispMyPlaceApi() {
  if(!navigator.geolocation){
    //Geolocation APIに対応していない場合
    $('#resultMapApi').html('<p>Geolocation APIに対応していないブラウザです。</p>');

    return false;
  }

  // 位置情報取得成功時の関数
  function success(position) {
    var latitude  = position.coords.latitude;   // 緯度
    var longitude = position.coords.longitude;  // 経度

    $('#resultMapApi').html(
      '<p><a class="btn-link" href="http://maps.apple.com/?q=' + latitude + ',' + longitude + '">地図アプリで開く</a><br>'
      + '<a class="btn-link" href="https://www.google.com/maps/search/?api=1&query=' + latitude + ',' + longitude + '">Google マップで開く</a></p>'
    );

    var latlng = new google.maps.LatLng(latitude, longitude); // Google マップに書き出し
    var map = new google.maps.Map(document.getElementById('mapApi'), {
        zoom: 16,       // ズーム値
        center: latlng, // 中心座標
    } ) ;
    // マーカーの新規出力
    new google.maps.Marker({
        map: map,
        position: latlng,
    } ) ;
  };

  // 位置情報取得失敗時の関数
  function error() {
    $('#resultMapApi').html('<p>位置情報取得に失敗しました。</p>');
  };

  navigator.geolocation.getCurrentPosition(success, error); // 成功とエラーを判断
  $('#btnMapApi').prop('disabled', true);
  $('#collapseMapApi').collapse('show'); // イメージエリアを表示
}

/**************************************************
 * 地図(Embed)
 **************************************************/
function dispMyPlaceEmbed() {
  if(!navigator.geolocation){
    //Geolocation APIに対応していない場合
    $('#resultMapEmbed').html('<p>Geolocation APIに対応していないブラウザです。</p>');

    return false;
  }

  // 位置情報取得成功時の関数
  function success(position) {
    var latitude  = position.coords.latitude;   // 緯度
    var longitude = position.coords.longitude;  // 経度

    $('#resultMapEmbed').html(
      '<p><a class="btn-link" href="http://maps.apple.com/?q=' + latitude + ',' + longitude + '">地図アプリで開く</a><br>'
      + '<a class="btn-link" href="https://www.google.com/maps/search/?api=1&query=' + latitude + ',' + longitude + '">Google マップで開く</a></p>'
    );

    $('#mapEmbed').html('<iframe class="w-100 h-100 border-0" src="https://maps.google.co.jp/maps?output=embed&q=' + latitude + ',' + longitude + '" frameborder="0" allowfullscreen></iframe>'); // 地図表示
  };

  // 位置情報取得失敗時の関数
  function error() {
    $('#resultMapEmbed').html('<p>位置情報取得に失敗しました。</p>');
  };

  navigator.geolocation.getCurrentPosition(success, error); // 成功とエラーを判断
  $('#btnMapEmbed').prop('disabled', true);
  $('#collapseMapEmbed').collapse('show'); // イメージエリアを表示
}

/**************************************************
 * カメラ(Media)
 **************************************************/
// カメラ画像リアルタイム表示
function startCameraMedia() {
  if(navigator.mediaDevices === undefined){
    navigator.mediaDevices = {};
  }

  if(navigator.mediaDevices.getUserMedia === undefined){
    navigator.mediaDevices.getUserMedia = function(constraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  
      if(!getUserMedia){
        return Promise.reject(new Error('getUserMediaに対応していないブラウザです。'));
      }
  
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  return navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: "environment"}});
}

/**************************************************
 * QRスキャン(Media)
 **************************************************/
// QRスキャン
function scanQr(canvas, canvasCtx) {
  
  var jqueryVideo = $('#videoQrScanMedia');
  if(jqueryVideo.get(0)){
    var width = jqueryVideo.width();
    var height = jqueryVideo.height();
    canvas.width = width;
    canvas.height = height;
    canvasCtx.drawImage(jqueryVideo.get(0), 0, 0, width, height); //canvasに描画
    
    var imageData = canvasCtx.getImageData(0, 0, width, height);
    var code = jsQR(imageData.data, imageData.width, imageData.height);

    if(code){
      //QRコードがスキャンできた場合
      jqueryVideo.addClass('d-none');
      $(canvas).removeClass('d-none');
      $('#resultQrScanMedia').html('<p>' + escapeHtml(code.data) + '</p>');
      drawLine(canvasCtx, code.location);
    }else{
      //QRコードがスキャンできなかった場合
      setTimeout(() => {
        scanQr(canvas, canvasCtx);
      }, 300);
    }
  }


}

// QR位置に囲み線を描画
function drawLine(ctx, pos, options={color:"blue", size:5}){
  // 線のスタイル
  ctx.strokeStyle = options.color;
  ctx.lineWidth   = options.size;

  // 描画
  ctx.beginPath();
  ctx.moveTo(pos.topLeftCorner.x, pos.topLeftCorner.y);
  ctx.lineTo(pos.topRightCorner.x, pos.topRightCorner.y);
  ctx.lineTo(pos.bottomRightCorner.x, pos.bottomRightCorner.y);
  ctx.lineTo(pos.bottomLeftCorner.x, pos.bottomLeftCorner.y);
  ctx.lineTo(pos.topLeftCorner.x, pos.topLeftCorner.y);
  ctx.stroke();
}