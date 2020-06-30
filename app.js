
async function imageClassificationWithImage() {
    console.log('Loading mobilenet..');
  
    // Load the model.
    net = await mobilenet.load();
    console.log('Successfully loaded model');
  
    // Make a prediction through the model on our image.
    const imgEl = document.getElementById('img');
    const result = await net.classify(imgEl);
    console.log(result);
  }
  
  async function imageClassificationWithWebcam() {
    console.log('Loading mobilenet..');
  
    // Load the model.
    net = await mobilenet.load();
    console.log('Successfully loaded model');
  
    // Create an object from Tensorflow.js data API which could capture image
    // from the web camera as Tensor.
    const webcam = await tf.data.webcam(webcamElement);
    while (true) {
      const img = await webcam.capture();
      const result = await net.classify(img);
  
      document.getElementById('console').innerText = `
        prediction: ${result[0].className}\n
        probability: ${result[0].probability}
      `;
      // Dispose the tensor to release the memory.
      img.dispose();
  
      // Give some breathing room by waiting for the next animation frame to
      // fire.
      await tf.nextFrame();
    }
  }
  
  const canvas = document.getElementById("canvas")
  const context = canvas.getContext('2d');
  //const result_canvas = document.getElementById("result_canvas")
  //const result_context = result_canvas.getContext('2d');
  const training_canvas = document.getElementById("training_canvas")
  const training_context = training_canvas.getContext('2d');

  let footer_btn_status = null;
  let training = false;
  webcam_status = false;
  training_webcam_status = false;

  //let currentStream;
  //let cameraID = "";
  const select = document.getElementById('select');

  const classes = ['Biodegradable Waste', 'Non-biodegradable Waste', 'Not a Waste'];

  const myGroups = ["BioWaste", "NonBioWaste", "NotAWaste"];
  // myobj = {webcam:false}

  // const myproxy = new Proxy(myobj, {
  //   set: function(myobj, key, value){
  //     if(myobj[key] !== value){
  //       myobj[key] = value;
  //     }
  //   }
  // })

  const start = async () => {

    // canvas.width = canvas.scrollWidth;
    // canvas.height = canvas.scrollHeight;
    // context.fillStyle = "white";
    // context.fillRect(0,0,canvas.width,canvas.height);
  
    const createKNNClassifier = async () => {
      console.log('Loading KNN Classifier');
      return await knnClassifier.create();
    };
    const createMobileNetModel = async () => {
      console.log('Loading Mobilenet Model');
      return await mobilenet.load();
    };
    const createWebcamInput = async () => {
      console.log('Loading Webcam Input');
      let webcamElement = null;
      if(!training){
        $('#detection_webcam_container').show()
        webcamElement = $('#webcam').get(0)

        canvas.width = canvas.scrollWidth;
      canvas.height = canvas.scrollWidth;
      }else{
        $('.div_training_12').hide();
        $('#training_webcam_container').show()
        webcamElement = $('#training_webcam').get(0)

        training_canvas.width = training_canvas.scrollWidth;
        training_canvas.height = training_canvas.scrollWidth;
      }
      
      // canvas.width = 0.9*canvas.scrollWidth;
      // canvas.height = 0.95*canvas.scrollWidth;
      // canvas.width = canvas.scrollWidth;
      // canvas.height = canvas.scrollWidth;
      //   context.fillStyle = "red";
      //   context.fillRect(0,0,canvas.width,canvas.height);
      
        //result_context.fillStyle = "blue";
        //result_context.fillRect(0,0,result_canvas.width,result_canvas.height);
      //const webcamElement = await document.getElementById('webcam');
      
      //console.log(webcamElement)
      // if(select.value === ""){
      //   return await tf.data.webcam(webcamElement, {facingMode:"environment"});
      // }else{
      // return await tf.data.webcam(webcamElement, {deviceId:select.value});
      // }
      let l = null;
      if(select.value === "Front"){
        l = await tf.data.webcam(webcamElement, {facingMode:"user"});
      }else{
        l = await tf.data.webcam(webcamElement, {facingMode:"environment"});
      }
      // let x = await tf.data.webcam(webcamElement)
      return l;
    };

    const clearCanvas = () => {
      context.fillStyle = "white";
        context.fillRect(0,0,canvas.width,canvas.height);
      
        //result_context.fillStyle = "white";
        //result_context.fillRect(0,0,result_canvas.width,result_canvas.height);
    }
  
    $('#div_middle').hide()
    $('#div_image').hide()
    $('#div_footer_training').hide()
    $('#detection_webcam_container').hide()
    $('#training_webcam_container').hide()
    $('.div_training_12').hide()

    //$('#div_training').hide()
    const mobilenetModel = await createMobileNetModel();
    // $('#div_image').show();
    var knnClassifierModel = await createKNNClassifier();
    //const webcamInput = await createWebcamInput();
    let webcamInput = {isClosed:true}
    $('#div_loader').hide()
    $('#div_middle').removeClass('scale-out').addClass('scale-in')
    $('#div_middle').show()
    //$('#div_footer_1').removeClass('scale-out').addClass('scale-in')
  
    const initializeElements = () => {
      document.getElementById('load_button').addEventListener('change', (event) => uploadModel(knnClassifierModel,event));
      document.getElementById('btn_save_model').addEventListener('click', async () => downloadModel(knnClassifierModel));

      document.getElementById('use_camera').addEventListener('click', async () => handleUseCamera());
      
      document.getElementById('cam_select_ok_btn').addEventListener('click', () => handleBtnSelectOk());

      document.getElementById('create_button').addEventListener('click', () => hideMiddleShowFooter());
      document.getElementById('upload_image').addEventListener('change', (event) => putImageToPage(event));
      document.getElementById('btn_detect').addEventListener('click', async () => handleBtnDetect());
      document.getElementById('btn_training').addEventListener('click', () => handleBtnTraining());
      document.getElementById('btn_end_training').addEventListener('click', () => handleBtnEndTraining());

      document.getElementById('btn_wet_waste').addEventListener('click', () => addDatasetClass(0));
      document.getElementById('btn_dry_waste').addEventListener('click', () => addDatasetClass(1));
      document.getElementById('btn_not_waste').addEventListener('click', () => addDatasetClass(2));
    };

    const initializeCamera = async () => {
      clearTrainingImage()
      webcamInput = await createWebcamInput();
      //console.log(webcamInput)
      if(!training){
        webcam_status = true;
        imageClassificationWithTransferLearningOnWebcam()
      }else{
        clearTrainingImage()
        training_webcam_status = true;
        imageClassificationWithTransferLearningOnWebcam()
      }
      footer_btn_status = "camera"
    }

    const handleUseCamera = async () => {
      // $('.dropdown-trigger').dropdown();
  //     var toastHTML = '<span>I am toast content</span><button class="btn-flat toast-action">Undo</button>';
  // M.toast({html: toastHTML});
    // if(training){
    //   handleTrainingWebcamStop()
    // }else{
    //   handleWebcamStop()
    // }
    if(!webcamInput.isClosed){
      webcamInput.stop()
    }
    //await navigator.mediaDevices.enumerateDevices().then(gotDevices);
    $('.modal').modal();
      $('.modal').modal('open');
    // navigator.mediaDevices.enumerateDevices()
    // .then((mediaDevices) => {
    //   mediaDevices.forEach(mediaDevice => {
    //     if (mediaDevice.kind === 'videoinput') {
    //       alert(`deviceid ${}, label ${}`)
    //     }
    //   })
    // });
    
  }

  function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  function gotDevices(mediaDevices) {
    select.innerHTML = '';
    select.appendChild(document.createElement('option'));
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        const option = document.createElement('option');
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Camera ${count++}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        select.appendChild(option);
      }
    });
  }

  const handleBtnSelectOk = async () => {
    console.log("okbtn ",webcamInput)
    await initializeCamera()
  }
    
  // const handleBtnSelectOk = () => {
  //   if (typeof currentStream !== 'undefined') {
  //     stopMediaTracks(currentStream);
  //   }
  //   const videoConstraints = {};
  //   if (select.value === '') {
  //     videoConstraints.facingMode = 'environment';
  //   } else {
  //     videoConstraints.deviceId = { exact: select.value };
  //   }
  //   const constraints = {
  //     video: videoConstraints,
  //     audio: false
  //   };
  //   navigator.mediaDevices
  //     .getUserMedia(constraints)
  //     .then(stream => {
  //       currentStream = stream;
  //       video.srcObject = stream;
  //       return navigator.mediaDevices.enumerateDevices();
  //     })
  //     .then(gotDevices)
  //     .catch(error => {
  //       console.error(error);
  //     });
  // }
  
    const saveClassifier = async (classifierModel) => {
      let datasets = await classifierModel.getClassifierDataset();
      // let datasetObject = {};
      // Object.keys(datasets).forEach(async (key) => {
      //   let data = await datasets[key].dataSync();
      //   datasetObject[key] = Array.from(data);
      // });
      // let jsonModel = JSON.stringify(datasetObject);

      let new_Data = Object.entries(datasets).map(([label, data])=>[label, Array.from(data.dataSync()), data.shape])
      let jsonModel = JSON.stringify(new_Data);
      //console.log("model info ", new_Data[0][2])
      // jsonModel = JSON.stringify(datasets)

      if(window.ReactNativeWebView === null ||  window.ReactNativeWebView === undefined){
      let downloader = document.createElement('a');
      downloader.download = "model.json";
      downloader.href = 'data:text/text;charset=utf-8,' + encodeURIComponent(jsonModel);
      document.body.appendChild(downloader);
      downloader.click();
      downloader.remove();
      }else{
        window.ReactNativeWebView.postMessage(jsonModel)
      }
    };
  
    const uploadModel = async (classifierModel, event) => {
      let inputModel = event.target.files;
      console.log("Uploading");
      //console.log(inputModel[0].name)
      let fr = new FileReader();
      if (inputModel.length>0) {
        let res = checkFile_v2(inputModel[0].name, "json")
        if(res){
        fr.onload = async () => {
          var dataset = fr.result;
          if(dataset !== null && dataset !== ""){
          
          let myData = Object.fromEntries( JSON.parse(dataset).map(([label, data, shape])=>[label, tf.tensor(data, shape)]) )
          knnClassifierModel.setClassifierDataset(myData);
          console.log(myData)

          // var tensorObj = JSON.parse(dataset);
  
          // Object.keys(tensorObj).forEach((key) => {
          //   tensorObj[key] = tf.tensor(tensorObj[key], [tensorObj[key].length / 1024, 1024]);
          // });
          //classifierModel.setClassifierDataset(tensorObj);
          //knnClassifierModel.setClassifierDataset(tensorObj);
          console.log("Classifier has been set up! Congrats! ");
          console.log("no of classes",knnClassifierModel.getNumClasses())
          hideMiddleShowFooter()
          }
          else{
            alert("File is either empty or invalid")
          }
        };
        await fr.readAsText(inputModel[0]);
        console.log("Uploaded");
      }
      }else{
        alert("No file is selected..")
      }
      // await fr.readAsText(inputModel[0]);
      // console.log("Uploaded");
    };

    function checkFile_v1(id, ext) {
      var fileElement = document.getElementById(id);
      var fileExtension = "";
      if (fileElement.value.lastIndexOf(".") > 0) {
          fileExtension = fileElement.value.substring(fileElement.value.lastIndexOf(".") + 1, fileElement.value.length);
      }
      if (fileExtension.toLowerCase() === ext) {
          return true;
      }
      else {
          alert(`You must select a ${ext} file for upload`);
          return false;
      }
  }

  function checkFile_v2(fileName, ext) {
    var fileExtension = "";
    if (fileName.lastIndexOf(".") > 0) {
        fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
    }
    if (fileExtension.toLowerCase() === ext) {
        return true;
    }
    else {
        alert(`You must select a ${ext} file for upload`);
        return false;
    }
}

    const hideMiddleShowFooter = () => {
      $('#div_middle').removeClass('scale-in').addClass('scale-out')
      $('#div_middle').hide()
      $('#div_footer').removeClass('scale-out').addClass('scale-in')
    }

    const handleWebcamStop = () => {
      if(!webcamInput.isClosed && !training){
      webcam_status = false;
      webcamInput.stop();
      //clearCanvas();
      $('#detection_webcam_container').hide()
      document.getElementById("result_label").innerHTML=""
      //document.getElementById("result_label").style.backgroundColor = "#fff"
    }
  }

  const handleTrainingWebcamStop = () => {
    if(!webcamInput.isClosed && footer_btn_status==="camera" && training){
    training_webcam_status = false;
    webcamInput.stop();
    $('#training_webcam_container').hide()
    //clearCanvas();
  }
}
  
    const handleBtnTraining = () => {
      handleWebcamStop()
      training=true;
      // webcam_status = false;
      // webcamInput.stop();
      // //clearCanvas();
      // $('#detection_webcam_container').hide()
      document.body.style.backgroundColor = "#fff";
      document.getElementById("result_label").innerHTML = ""

      $('#btn_detect').removeClass('scale-in').addClass('scale-out')
      $('#div_image').removeClass('scale-in').addClass('scale-out');
      $('#div_image').hide();
      let div_img = document.getElementById("output")
      div_img.src = ""
      $('#btn_training').removeClass('scale-in').addClass('scale-out')
      $('#btn_training').hide()
      $('#div_training').removeClass('scale-out').addClass('scale-in')
      $('#div_footer_training').show()
      $('#div_footer_training').removeClass('scale-out').addClass('scale-in')
    }

    const handleBtnEndTraining = () => {
      handleTrainingWebcamStop()
      training=false;
      
      // let div_img = document.getElementById("training_img")
      // div_img.src = ""
      clearTrainingImage();
      footer_btn_status = null
      $('.div_training_12').hide()
      $('#div_footer_training').removeClass('scale-in').addClass('scale-out')
      $('#div_footer_training').hide()
      $('#div_training').removeClass('scale-in').addClass('scale-out')
      $('#btn_training').show()
      $('#btn_training').removeClass('scale-out').addClass('scale-in')

    }
    const clearTrainingImage = () => {
      let div_img = document.getElementById("training_img")
      div_img.src = ""
    }
    const downloadModel = async (classifierModel) => {
      saveClassifier(classifierModel);
    };

    const handleBtnDetect = async () => {
      $('#btn_detect').removeClass('scale-in').addClass('scale-out')
      $('#image_detect_result').removeClass('scale-out').addClass('scale-in')

      if(knnClassifierModel.getNumClasses() === 3){
      const img = document.getElementById("output")
      const activation = mobilenetModel.infer(img, 'conv_preds');
      const result = await knnClassifierModel.predictClass(activation);

      if(result.label === "0"){
        document.getElementById("image_detect_result").innerHTML = classes[result.label]
        document.body.style.backgroundColor = "#3de334"
      }
      else if(result.label === "1"){
        //console.log("hi ",typeof(result.label))
        document.getElementById("image_detect_result").innerHTML = classes[result.label]
        document.body.style.backgroundColor = "#6fa4d9"
      }
      else if(result.label === "2"){
        document.getElementById("image_detect_result").innerHTML = classes[result.label]
        document.body.style.backgroundColor = "#fff"
      }
    }else{
      document.getElementById("image_detect_result").innerHTML = "Training Required..."
    }
    }

    const putImageToPage = (event) => {
      //$('#div_image').show();
      if(!training){
      document.body.style.backgroundColor = "#fff"
      document.getElementById("result_label").innerHTML = ""
      document.getElementById("image_detect_result").innerHTML = ""
      }

      handleWebcamStop();
      handleTrainingWebcamStop();
      footer_btn_status = "image";

      if(!training){
        $('#div_image').show();
        $('#div_image').removeClass('scale-out').addClass('scale-in');
      }else{
        $('.div_training_12').show();
      }
      var input = event.target;
  
      var reader = new FileReader();
      reader.onload = function () {
        document.body.style.backgroundColor = "#fff";

        var dataURL = reader.result;
        if(training){
          var output = document.getElementById('training_img');
          output.src = dataURL;
        }else{
          var output = document.getElementById('output');
          output.src = dataURL;
          $('#btn_detect').removeClass('scale-out').addClass('scale-in')
        }
        // var output = document.getElementById('output');
        // output.src = dataURL;
        // $('#btn_detect').removeClass('scale-out').addClass('scale-in')
      };
      reader.readAsDataURL(input.files[0]);
    };
  
    const addDatasetClass = async (classId) => {
      if(footer_btn_status==="camera"){
        // Capture an image from the web camera.
        const img = await webcamInput.capture();
    
        // Get the intermediate activation of MobileNet 'conv_preds' and pass that
        // to the KNN classifier.
        const activation = mobilenetModel.infer(img, 'conv_preds');
        
        //console.log("shape ",activation.shape)
        // Pass the intermediate activation to the classifier.
        knnClassifierModel.addExample(activation, classId);
    
        // Dispose the tensor to release the memory.
        img.dispose();
      }
      else if(footer_btn_status==="image"){
        const img = document.getElementById("training_img")
        const activation = mobilenetModel.infer(img, 'conv_preds');
        knnClassifierModel.addExample(activation, classId);
      }
    };
    const imageClassificationWithTransferLearningOnWebcam = async () => {
      console.log("Machine Learning on the web is ready");
      if(!training){
      const video = $('#webcam').get(0);
      while (true) {
        if(!webcam_status){
          break;
        }

        var videoSize = { width: video.videoWidth, height: video.videoHeight };
        var canvasSize = { width: canvas.width, height: canvas.height };
        var param = (videoSize.height * canvasSize.width)/canvasSize.height;
        context.drawImage(video, (videoSize.width - param)/2, 0, param, videoSize.height, 0, 0, canvasSize.width, canvasSize.height);

        if (knnClassifierModel.getNumClasses() === 3) {
          const img = await webcamInput.capture();
  
          // Get the activation from mobilenet from the webcam.
          const activation = mobilenetModel.infer(img, 'conv_preds');
          // Get the most likely class and confidences from the classifier module.
          const result = await knnClassifierModel.predictClass(activation);

        //   document.getElementById('console').innerText = `
        //   prediction: ${classes[result.label]}\n
        //   probability: ${result.confidences[result.label]}
        // `;
        //console.log("result ",result.label, typeof(result.label))
          if(result.label === "0"){
            document.getElementById("result_label").innerHTML = classes[result.label]
            document.body.style.backgroundColor = "#3de334"
          }
          else if(result.label === "1"){
            //console.log("hi ",typeof(result.label))
            document.getElementById("result_label").innerHTML = classes[result.label]
            document.body.style.backgroundColor = "#6fa4d9"
          }
          else if(result.label === "2"){
            document.getElementById("result_label").innerHTML = classes[result.label]
            document.body.style.backgroundColor = "#fff"
          }
  
          // Dispose the tensor to release the memory.
          img.dispose();
        }else{
          // result_context.fillStyle = "#eb8934";
          // result_context.fillRect(0,0,result_canvas.width,result_canvas.height);
          // result_context.fillStyle = "#000";
          // result_context.font = "30px bold Comic Sans MS";
          // result_context.textAlign = "center";
          // result_context.fillText("Training is Required...",result_canvas.width/2,result_canvas.height/2);
          document.getElementById("result_label").innerHTML="Training is Required..."
          //document.getElementById("result_label").style.backgroundColor = "#eb8934"
        }
        await tf.nextFrame();
      }
    }else{
      const video = $('#training_webcam').get(0);
      while (true) {
        if(!training_webcam_status){
          break;
        }

        var videoSize = { width: video.videoWidth, height: video.videoHeight };
        var canvasSize = { width: training_canvas.width, height: training_canvas.height };
        var param = (videoSize.height * canvasSize.width)/canvasSize.height;
        training_context.drawImage(video, (videoSize.width - param)/2, 0, param, videoSize.height, 0, 0, canvasSize.width, canvasSize.height);

        await tf.nextFrame();
      }
    }
    };
  
    await initializeElements();
    //await imageClassificationWithTransferLearningOnWebcam();
  };
  
  window.onload = () => {
    start();
  };